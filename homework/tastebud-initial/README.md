# Recipe Finder Web Application

A web application that helps users find recipes based on the ingredients they have available.

## Features

- Search for recipes by entering ingredients
- Clean and responsive user interface
- Real-time recipe filtering

## Setup and Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Run the application:

```bash
python app.py
```

3. Open your web browser and navigate to `http://localhost:5000`

## Usage

1. Enter your ingredients in the search box, separated by commas (e.g., "eggs, cheese, pasta")
2. Toggle "Include similar ingredients" to broaden your search to include ingredients from the same category
3. Click "Find Recipes" to see matching recipes
4. Browse through recipe cards showing:
   - Recipe title and cuisine type
   - Difficulty level and prep time
   - Required ingredients
   - Basic instructions
   - Dietary information
5. Click "Start Step-by-Step Guide" on any recipe to enter walkthrough mode
6. In the walkthrough:
   - Follow step-by-step cooking instructions
   - Use Previous/Next buttons to navigate
   - View available ingredient substitutes by clicking "Show substitutes"
   - Track your progress with the progress bar

## Development Notes

While ingredient subtitutes are implemented, the functionality for upadting recipes to account for substitutions is not currently implemented.

Currently substitutes are hard-coded in a json file. This functionality will be replaced by an LLM suggestion in the future. This may make substitutions less accurate and less available.
