import os
import re
import argparse
from pathlib import Path

DEFAULT_FILENAMES = {
    'javascript': 'script.js',
    'js': 'script.js',
    'python': 'script.py',
    'py': 'script.py',
    'css': 'styles.css',
    'html': 'index.html',
    'java': 'Main.java',
    'cpp': 'main.cpp',
    'c': 'main.c',
    'sql': 'query.sql',
    'php': 'index.php',
    'ruby': 'script.rb',
    'go': 'main.go',
    'rust': 'main.rs',
    'typescript': 'script.ts',
    'ts': 'script.ts',
    'yaml': 'config.yml',
    'yml': 'config.yml',
    'json': 'config.json',
    'xml': 'config.xml',
    'markdown': 'README.md',
    'md': 'README.md',
    'bash': 'script.sh',
    'sh': 'script.sh',
    'dockerfile': 'Dockerfile'
}

def extract_filename_from_comments(content):
    """Wyodrębnia nazwę pliku z różnych typów komentarzy."""
    # Lista wzorców dla różnych typów komentarzy
    patterns = [
        # Komentarze jednoliniowe
        r'(?:^|\n)//\s*([^\n]*\.[\w]+)',  # JavaScript, C++
        r'(?:^|\n)#\s*([^\n]*\.[\w]+)',   # Python, Bash, Ruby
        # Komentarze wieloliniowe
        r'/\*\s*(.*?\.[\w]+).*?\*/',       # C-style (/* */)
        r'<!--\s*(.*?\.[\w]+).*?-->',      # HTML/XML
        r'"""\s*(.*?\.[\w]+).*?"""',       # Python docstring
        r"'''\s*(.*?\.[\w]+).*?'''",       # Python docstring (pojedyncze cudzysłowy)
        # Specjalne komentarze
        r'--\s*([^\n]*\.[\w]+)',          # SQL
        r'%\s*([^\n]*\.[\w]+)',           # LaTeX
    ]

    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            filename = match.group(1).strip()
            if '.' in filename:  # Upewnij się, że znaleziony tekst zawiera rozszerzenie
                return filename

    return None

def extract_file_content(markdown_content):
    """Wyodrębnia zawartość plików z bloków kodu w Markdown."""
    # Pattern do znajdowania bloków kodu z określonym językiem i komentarzem
    pattern = r'```(\w+)?\s*(?:#\s*(.*?)\n|\n)?(.*?)```'
    matches = re.finditer(pattern, markdown_content, re.DOTALL)

    files_content = {}
    file_counter = {}  # Licznik dla domyślnych nazw plików

    for match in matches:
        language = match.group(1)
        comment = match.group(2)
        content = match.group(3).strip()

        # Ignoruj bloki markdown zawierające strukturę projektu
        if language == 'markdown' and 'media-monitor/' in content:
            continue

        filename = None

        # 1. Sprawdź komentarz nad blokiem kodu
        if comment and ('.' in comment or '/' in comment):
            filename = comment.strip()

        # 2. Sprawdź komentarze wewnątrz kodu
        if not filename:
            filename = extract_filename_from_comments(content)

        # 3. Użyj domyślnej nazwy pliku dla danego języka
        if not filename and language:
            language = language.lower()
            if language in DEFAULT_FILENAMES:
                # Dodaj licznik jeśli już istnieje plik z tą nazwą
                base_name = DEFAULT_FILENAMES[language]
                if base_name in file_counter:
                    file_counter[base_name] += 1
                    name, ext = os.path.splitext(base_name)
                    filename = f"{name}_{file_counter[base_name]}{ext}"
                else:
                    file_counter[base_name] = 0
                    filename = base_name

        if filename:
            files_content[filename] = content

    return files_content


def create_directory_structure(structure_text):
    """Tworzy listę ścieżek na podstawie tekstowej struktury katalogów."""
    paths = []
    for line in structure_text.split('\n'):
        line = line.strip()
        if not line or '```' in line:
            continue

        # Usuń znaki struktury drzewa
        path = re.sub(r'^[│├└─\s]+', '', line)
        if path and not path.startswith('#'):
            # Dodaj slash na końcu katalogów
            if not ('.' in path) and not path.endswith('/'):
                path += '/'
            paths.append(path)

    return paths

def ensure_directory(file_path):
    """Tworzy katalogi dla podanej ścieżki pliku."""
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

def create_files_from_markdown(markdown_file, output_dir='.'):
    """Główna funkcja do tworzenia plików z dokumentu Markdown."""
    try:
        # Wczytaj plik Markdown
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Utwórz katalog wyjściowy
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # Znajdź strukturę katalogów
        structure_match = re.search(r'```markdown\n(.*?)\n```', content, re.DOTALL)
        if structure_match:
            paths = create_directory_structure(structure_match.group(1))

            # Utwórz katalogi
            for path in paths:
                full_path = output_path / path
                if path.endswith('/'):
                    full_path.mkdir(parents=True, exist_ok=True)
                else:
                    ensure_directory(str(full_path))

        # Wyodrębnij zawartość plików
        files_content = extract_file_content(content)

        # Utwórz pliki
        created_files = []
        for filename, file_content in files_content.items():
            # Wyczyść nazwę pliku z komentarzy
            clean_filename = filename.replace('# ', '').strip()
            file_path = output_path / clean_filename
            ensure_directory(str(file_path))

            print(f"Tworzenie pliku: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content + '\n')

            # Ustaw uprawnienia dla plików wykonywalnych
            if clean_filename.endswith('.sh'):
                os.chmod(file_path, 0o755)

            created_files.append(clean_filename)

        print("\nUtworzono następujące pliki:")
        for f in sorted(created_files):
            print(f"- {f}")
        print("\nStruktura projektu została utworzona pomyślnie!")

    except Exception as e:
        print(f"Wystąpił błąd: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Generuje strukturę projektu z pliku Markdown.')
    parser.add_argument('markdown_file', help='Ścieżka do pliku Markdown')
    parser.add_argument('--output', '-o', default='.', help='Katalog wyjściowy (domyślnie: bieżący)')

    args = parser.parse_args()
    create_files_from_markdown(args.markdown_file, args.output)

if __name__ == '__main__':
    main()
