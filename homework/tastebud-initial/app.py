from flask import Flask, render_template, request, jsonify
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

def load_recipes():
    with open('recipes.json', 'r') as f:
        recipes = json.load(f)['recipes']
        # Parse instructions into steps
        for recipe in recipes:
            recipe['steps'] = [step.strip() for step in recipe['instructions'].split('\n')]
        return recipes

def load_ingredient_categories():
    with open('ingredient_categories.json', 'r') as f:
        return json.load(f)['categories']

def find_ingredient_category(ingredient, categories):
    """Find which category an ingredient belongs to"""
    ingredient = ingredient.lower()
    for category, data in categories.items():
        if ingredient in [item.lower() for item in data['items']]:
            return category
    return None

def are_ingredients_similar(ingredient1, ingredient2, categories):
    """Check if two ingredients are in the same category"""
    cat1 = find_ingredient_category(ingredient1, categories)
    cat2 = find_ingredient_category(ingredient2, categories)
    return cat1 is not None and cat1 == cat2

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_recipes():
    ingredients = request.json.get('ingredients', [])
    use_similar = request.json.get('use_similar', False)
    recipes = load_recipes()
    categories = load_ingredient_categories()
    
    matching_recipes = []
    
    for i, recipe in enumerate(recipes):
        has_match = False
        for ingredient in ingredients:
            ing_lower = ingredient.lower()
            # Check for exact match
            if any(ing_lower == recipe_ing.lower() for recipe_ing in recipe['ingredients']):
                has_match = True
                break
            # Check for similar match if enabled
            elif use_similar and any(are_ingredients_similar(ingredient, recipe_ing, categories)
                                   for recipe_ing in recipe['ingredients']):
                has_match = True
                break
        
        if has_match:
            recipe_copy = recipe.copy()
            recipe_copy['index'] = i  # Add the original index
            matching_recipes.append(recipe_copy)
    
    return jsonify(matching_recipes)

@app.route('/recipe/<int:recipe_index>')
def recipe_walkthrough(recipe_index):
    recipes = load_recipes()
    categories = load_ingredient_categories()
    
    if 0 <= recipe_index < len(recipes):
        recipe = recipes[recipe_index]
        # Parse instructions into steps if not already done
        if 'steps' not in recipe:
            recipe['steps'] = [step.strip() for step in recipe['instructions'].split('\n')]
        # Add substitutes for each ingredient
        substitutes = {}
        for ingredient in recipe['ingredients']:
            for category, data in categories.items():
                if ingredient.lower() in [item.lower() for item in data['items']]:
                    # Get up to 5 substitutes from the same category
                    substitutes[ingredient] = [item for item in data['items']
                                              if item.lower() != ingredient.lower()][:5]
                    break
        return render_template('walkthrough.html', recipe=recipe, substitutes=substitutes)
    return 'Recipe not found', 404

if __name__ == '__main__':
    app.run(debug=True)
