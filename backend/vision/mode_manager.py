import importlib, os

#Auto discovers all modes in the /modes folder
def get_available_modes():
    modes = {}
    for file in os.listdir("./backend/vision/modes"):
        if file.endswith(".py"):
            name = file.replace(".py", "")
            module = importlib.import_module(f"modes.{name}")
            modes[name] = module
    return modes
modes = get_available_modes()
current_mode = modes["Default"]