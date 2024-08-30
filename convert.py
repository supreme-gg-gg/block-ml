import nbformat as nbf

# Make new notebook, read & add code to cell, write notebook to new file

def convert_ipynb(input_file="build/generatedCode.py", output_file="build/generatedNotebook.ipynb"):
    
    nb = nbf.v4.new_notebook()

    with open(input_file, "r") as f:
        python_code = f.read()
    
    code_cell = nbf.v4.new_code_cell(python_code)

    nb.cells.append(code_cell)

    with open(output_file, "w") as f:
        nbf.write(nb, f)

if __name__ == "__main__":
    convert_ipynb()