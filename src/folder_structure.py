import os

def write_directory_structure(output_file="directory_structure.txt"):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(f"Directory Structure of: {current_dir}\n\n")
        
        for root, dirs, files in os.walk(current_dir):
            level = root.replace(current_dir, "").count(os.sep)
            indent = "    " * level
            file.write(f"{indent}[D] {os.path.basename(root)}\n")
            sub_indent = "    " * (level + 1)
            for f in files:
                file.write(f"{sub_indent}[F] {f}\n")
    
    print(f"Directory structure written to {output_file}")

if __name__ == "__main__":
    write_directory_structure()