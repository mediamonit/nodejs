
import os
import re
import argparse
from pathlib import Path

def extract_file_content(markdown_content):
    """Wyodrębnia zawartość plików z bloków kodu w Markdown."""
    # Wzorzec do znajdowania bloków kodu z nazwą pliku w komentarzu
    pattern = r'```(?:\w+)?\s*(?:#\s*(.*?)\n|\n)?(.*?)```'
    matches = re.finditer(pattern, markdown_content, re.DOTALL)

    files_content = {}
    for match in matches:
        comment = match.group(1)
        content = match.group(2)

        if comment and comment.strip():
            # Usuń komentarz z nazwy pliku
            filename = comment.strip()
            files_content[filename] = content.strip()

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
                if not path.endswith('/') and '.' in path:
                    ensure_directory(str(full_path))
                else:
                    full_path.mkdir(parents=True, exist_ok=True)

        # Wyodrębnij zawartość plików
        files_content = extract_file_content(content)

        # Utwórz pliki
        for filename, file_content in files_content.items():
            file_path = output_path / filename
            ensure_directory(str(file_path))

            print(f"Tworzenie pliku: {file_path}")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_content + '\n')

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
