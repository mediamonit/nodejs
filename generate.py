import os
import re
import argparse
from pathlib import Path

def extract_file_content(markdown_content):
    """Wyodrębnia zawartość plików z bloków kodu w Markdown."""
    # Pattern do znajdowania bloków kodu z określonym językiem i komentarzem
    pattern = r'```(\w+)?\s*(?:#\s*(.*?)\n|\n)?(.*?)```'
    matches = re.finditer(pattern, markdown_content, re.DOTALL)

    files_content = {}

    for match in matches:
        language = match.group(1)
        comment = match.group(2)
        content = match.group(3).strip()

        # Ignoruj bloki markdown zawierające strukturę projektu
        if language == 'markdown':
            continue

        filename = None

        # Sprawdź czy to skrypt bash
        if language == 'bash':
            # Szukaj nazwy pliku w pierwszych liniach
            lines = content.split('\n')
            for line in lines[:3]:  # Sprawdź pierwsze 3 linie
                if line.startswith('#') and '.sh' in line:
                    filename = line.replace('#', '').strip()
                    break

        # Jeśli nie znaleziono nazwy w skrypcie bash, sprawdź komentarz
        if not filename and comment:
            # Typowe rozszerzenia plików
            file_extensions = ['.yml', '.conf', '.sh', '.example', '.gitignore', 'Dockerfile']

            # Sprawdź czy komentarz zawiera ścieżkę pliku
            if any(ext in comment for ext in file_extensions) or '/' in comment:
                filename = comment.strip()

        # Dla plaintext sprawdź pierwszą linię
        elif language == 'plaintext' and content.startswith('#'):
            first_line = content.split('\n')[0]
            if '.env.example' in first_line or '.gitignore' in first_line:
                filename = first_line.replace('# ', '').strip()
                # Usuń pierwszą linię z zawartości
                content = '\n'.join(content.split('\n')[1:]).strip()

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
