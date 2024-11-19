import json
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import shutil
import os

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'warframedroppage'
}

# File path to JSON
file_path = "drops.warframestat.us_data_all.json"

# Recursive function to process all types of rewards and create separate tables for each
def process_rewards(data):
    rows = {
        "missionRewards": [],
        "relics": [],
        "transientRewards": [],
        "modLocations": [],
        "sortieRewards": [],
        "keyRewards": [],
        "cetusBountyRewards": [],
        "solarisBountyRewards": [],
        "deimosRewards": [],
        "syndicateRewards": [],
        "resourceByAvatar": [],
        "sigilByAvatar": [],
        "additionalItemByAvatar": [],
    }

    # Process missionRewards
    if "missionRewards" in data:
        mission_rewards = data.get("missionRewards", {})
        for planet, locations in mission_rewards.items():
            for location, details in locations.items():
                game_mode = details.get("gameMode", None)
                is_event = details.get("isEvent", None)
                rewards = details.get("rewards", {})
                
                # Handle different types of `rewards`
                if isinstance(rewards, dict):  # Rewards organized by rotation
                    for rotation, items in rewards.items():
                        for item in items:
                            row = {
                                "planet": planet,
                                "location": location,
                                "gameMode": game_mode,
                                "isEvent": is_event,
                                "rotation": rotation,
                                "itemName": item.get("itemName", None),
                                "rarity": item.get("rarity", None),
                                "chance": item.get("chance", None),
                                "tablename": "missionRewards",
                            }
                            rows["missionRewards"].append(row)
                elif isinstance(rewards, list):  # Rewards directly as a list
                    for item in rewards:
                        row = {
                            "planet": planet,
                            "location": location,
                            "gameMode": game_mode,
                            "isEvent": is_event,
                            "rotation": None,  # No rotation information
                            "itemName": item.get("itemName", None),
                            "rarity": item.get("rarity", None),
                            "chance": item.get("chance", None),
                            "tablename": "missionRewards",
                        }
                        rows["missionRewards"].append(row)
                
    # Process relics
    if 'relics' in data:
        for relic in data['relics']:  # Loop through each relic in the 'relics' section
            relic_tier = relic.get('tier', None)
            relic_name = relic.get('relicName', None)
            relic_state = relic.get('state', None)
            relic_rewards = relic.get('rewards', [])
            
            for item in relic_rewards:
                row = {
                    "relicTier": relic_tier,
                    "relicName": relic_name,
                    "relicState": relic_state,
                    "itemName": item.get("itemName", None),
                    "rarity": item.get("rarity", None),
                    "chance": item.get("chance", None),
                    "tablename": "relics",
                }
                rows["relics"].append(row)

    # Process transientRewards
    if "transientRewards" in data:
        transient_rewards = data.get("transientRewards", [])
        for reward in transient_rewards:
            objective_name = reward.get("objectiveName", None)
            reward_items = reward.get("rewards", [])
            for item in reward_items:
                row = {
                    "objectiveName": objective_name,
                    "itemName": item.get("itemName", None),
                    "rarity": item.get("rarity", None),
                    "chance": item.get("chance", None),
                    "rotation": item.get("rotation", None),
                    "tablename": "transientRewards",
                }
                rows["transientRewards"].append(row)

    # Process modLocations
    if "modLocations" in data:
        mod_locations = data.get("modLocations", [])
        for mod in mod_locations:
            mod_name = mod.get("modName", None)
            enemies = mod.get("enemies", [])
            for enemy in enemies:
                row = {
                    "itemName": mod_name,
                    "enemyName": enemy.get("enemyName", None),
                    "enemyModDropChance": enemy.get("enemyModDropChance", None),
                    "rarity": enemy.get("rarity", None),
                    "chance": enemy.get("chance", None),
                    "tablename": "modLocations",
                }
                rows["modLocations"].append(row)

    # Process sortieRewards
    if "sortieRewards" in data:
        sortie_rewards = data.get("sortieRewards", [])
        for reward in sortie_rewards:
            row = {
                "itemName": reward.get("itemName", None),
                "rarity": reward.get("rarity", None),
                "chance": reward.get("chance", None),
                "tablename": "sortieRewards",
            }
            rows["sortieRewards"].append(row)

    # Process keyRewards
    if "keyRewards" in data:
        key_rewards = data.get("keyRewards", [])
        for reward in key_rewards:
            key_name = reward.get("keyName", None)
            reward_items = reward.get("rewards", {})
            for rotation, items in reward_items.items():
                for item in items:
                    row = {
                        "keyName": key_name,
                        "rotation": rotation,
                        "itemName": item.get("itemName", None),
                        "rarity": item.get("rarity", None),
                        "chance": item.get("chance", None),
                        "tablename": "keyRewards",
                        }
                    rows["keyRewards"].append(row)

    # Process cetusBountyRewards
    if "cetusBountyRewards" in data:
        cetus_bounty_rewards = data.get("cetusBountyRewards", [])
        for reward in cetus_bounty_rewards:
            bounty_level = reward.get("bountyLevel", None)
            reward_items = reward.get("rewards", {})
            for rotation, items in reward_items.items():
                for item in items:
                    row = {
                        "bountyLevel": bounty_level,
                        "rotation": rotation,
                        "itemName": item.get("itemName", None),
                        "rarity": item.get("rarity", None),
                        "chance": item.get("chance", None),
                        "stage": item.get("stage", None),
                        "tablename": "cetusBountyRewards",
                    }
                    rows["cetusBountyRewards"].append(row)


    # Process solarisBountyRewards
    if "solarisBountyRewards" in data:
        solaris_bounty_rewards = data.get("solarisBountyRewards", [])
        for reward in solaris_bounty_rewards:
            bounty_level = reward.get("bountyLevel", None)
            reward_items = reward.get("rewards", {})
            
            # Loop through the reward groups (e.g., "A", "B", etc.)
            for rotation, items in reward_items.items():
                for item in items:
                    row = {
                        "bountyLevel": bounty_level,
                        "rotation": rotation,  # Store the rotation key (e.g., "A", "B", etc.)
                        "itemName": item.get("itemName", None),
                        "rarity": item.get("rarity", None),
                        "chance": item.get("chance", None),
                        "stage": item.get("stage", None),
                        "table": "solarisBountyRewards",
                    }
                    rows["solarisBountyRewards"].append(row)

    # Process deimosRewards
    if "deimosRewards" in data:
        deimos_rewards = data.get("deimosRewards", [])
        for reward in deimos_rewards:
            bounty_level = reward.get("bountyLevel", None)
            reward_items = reward.get("rewards", {})

            # Loop through the reward groups (e.g., "A", "B", etc.)
            for rotation, items in reward_items.items():
                for item in items:
                    row = {
                        "bountyLevel": bounty_level,
                        "rotation": rotation,  # Store the rotation key (e.g., "A", "B", etc.)
                        "itemName": item.get("itemName", None),
                        "rarity": item.get("rarity", None),
                        "chance": item.get("chance", None),
                        "stage": item.get("stage", None),
                        "tablename": "deimosRewards",
                    }
                    rows["deimosRewards"].append(row)
        
    # Process syndicateRewards
    if "syndicates" in data:
        syndicates = data.get("syndicates", {})
        for syndicate_name, rewards in syndicates.items():
            for reward in rewards:
                row = {
                    "syndicateName": syndicate_name,
                    "itemName": reward.get("item", None),
                    "chance": reward.get("chance", None),
                    "rarity": reward.get("rarity", None),
                    "place": reward.get("place", None),
                    "standing": reward.get("standing", None),
                    "tablename": "syndicateRewards",
                }
                rows["syndicateRewards"].append(row) 
               
               
    # Process resourceByAvatar
    if "resourceByAvatar" in data:
        resource_by_avatar = data.get("resourceByAvatar", [])
        for resource in resource_by_avatar:
            source = resource.get("source", None)
            items = resource.get("items", [])

            for item in items:
                row = {
                    "source": source,
                    "itemName": item.get("item", None),
                    "rarity": item.get("rarity", None),
                    "chance": item.get("chance", None),
                    "tablename": "resourceByAvatar",
                }
                rows["resourceByAvatar"].append(row)     
                
    # Process sigilByAvatar
    if "sigilByAvatar" in data:
        sigil_by_avatar = data.get("sigilByAvatar", [])
        for sigil in sigil_by_avatar:
            source = sigil.get("source", None)
            items = sigil.get("items", [])

            for item in items:
                row = {
                    "source": source,
                    "itemName": item.get("item", None),
                    "rarity": item.get("rarity", None),
                    "chance": item.get("chance", None),
                    "tablename": "sigilByAvatar",
                }
                rows["sigilByAvatar"].append(row)       
                
    # Process additionalItemByAvatar
    if "additionalItemByAvatar" in data:
        additional_item_by_avatar = data.get("additionalItemByAvatar", [])
        for item_data in additional_item_by_avatar:
            source = item_data.get("source", None)
            items = item_data.get("items", [])

            for item in items:
                row = {
                    "source": source,
                    "itemName": item.get("item", None),
                    "rarity": item.get("rarity", None),
                    "chance": item.get("chance", None),
                    "tablename": "additionalItemByAvatar",
                }
                rows["additionalItemByAvatar"].append(row) 
    return rows

# Function to write rows to a text file for debugging
def write_rows_to_txt(rows, table_name):
    folder_path = "Txt"
    os.makedirs(folder_path, exist_ok=True)
    filename = f"{table_name}_output.txt"
    with open(filename, "w", encoding="utf-8") as file:
        for row in rows:
            file.write(str(row) + "\n")
    folder_file_path = os.path.join(folder_path, filename)
    shutil.move(filename, folder_file_path)
    print(f"Rows written to {folder_file_path}.")

# Function to check if a record already exists
def check_if_exists(cursor, table_name, row):
    # Get the columns of the row dynamically
    columns = list(row.keys())
    
    # Build the WHERE clause dynamically based on the available columns
    where_clause = " AND ".join([f"`{col}` = %s" for col in columns])
    
    # Prepare the SQL query
    query = f"SELECT COUNT(*) FROM `{table_name}` WHERE {where_clause}"
    
    # Execute the query with values from the row
    cursor.execute(query, tuple(row.values()))
    
    # Fetch the result and return whether the record exists
    result = cursor.fetchone()
    return result[0] > 0

# Main function to create table and insert data
def process_json_to_sql(file_path):
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Load JSON data
        with open(file_path, 'r', encoding='utf8') as json_file:
            data = json.load(json_file)

        # Extract and process rows for each table
        rows = process_rewards(data)
        
        # Process each category of rewards into its own table
        for table_name, table_rows in rows.items():
            if table_rows:  # If the table has rows
                # Write rows to text file for debugging
                write_rows_to_txt(table_rows, table_name)

                #Delete tables
                delete_table_query = f"DROP TABLE IF EXISTS `{table_name}`;"
                cursor.execute(delete_table_query)
                print(f"Table `{table_name}` deleted.")

                # Dynamically create the table schema
                columns = table_rows[0].keys()
                column_definitions = ", ".join(f"`{col}` TEXT" for col in columns)
                create_table_query = f"CREATE TABLE IF NOT EXISTS `{table_name}` (id INT AUTO_INCREMENT PRIMARY KEY, {column_definitions});"
                cursor.execute(create_table_query)
                print(f"Table `{table_name}` created successfully with columns: {', '.join(columns)}")

                # Insert data into the table
                insert_query = f"INSERT INTO `{table_name}` ({', '.join(f'`{col}`' for col in columns)}) VALUES ({', '.join(['%s'] * len(columns))})"
                for row in table_rows:
                    # if not check_if_exists(cursor, table_name, row):  # Check if the record already exists
                        cursor.execute(insert_query, list(row.values()))
                        # print(f"Inserted: {row['itemName']}")

                # Commit changes
                conn.commit()
                print(f"Inserted {len(table_rows)} new records into the table `{table_name}`.")

    except Error as e:
        print(f"Database error: {e}")
        print("Rolling back changes.")
        conn.rollback()

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()
            print("Connection closed.")

# Run the function
process_json_to_sql(file_path)