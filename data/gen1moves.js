const gen1moves = [
  {
    Move: "Leech Life",
    Type: "Bug",
    Power: 20,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An HP-draining attack. It adds half the HP it drained from the target to the attacker's HP."
  },
  {
    Move: "Pin Missile",
    Type: "Bug",
    Power: 14,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An attack that fires many needle-like projectiles from the body. Strikes several times."
  },
  {
    Move: "String Shot",
    Type: "Bug",
    Power: "-",
    Accuracy: 95,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Strings are sprayed out and wrapped around the target to reduce its SPEED."
  },
  {
    Move: "Twineedle",
    Type: "Bug",
    Power: 25,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An attack that strikes twice. The target may occasionally become poisoned."
  },
  {
    Move: "Dragon Rage",
    Type: "Dragon",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "A DRAGON-type attack. It inflicts a set amount of damage, regardless of the target's type."
  },
  {
    Move: "Thunder",
    Type: "Electric",
    Power: 120,
    Accuracy: 70,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "The strongest of all ELECTRIC-type attacks. Has a one-in-ten chance of paralyzing the target."
  },
  {
    Move: "Thunderpunch",
    Type: "Electric",
    Power: 75,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A special ELECTRIC-type attack. Has a one-in-ten chance of paralyzing the target."
  },
  {
    Move: "Thundershock",
    Type: "Electric",
    Power: 40,
    Accuracy: 100,
    PP: 30,
    Category: "Special",
    CategoryST: "Special",
    Description: "An ELECTRIC-type attack. Has a one-in-ten chance of paralyzing the target."
  },
  {
    Move: "Thunder Wave",
    Type: "Electric",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special move that causes paralysis. When paralyzed, the victim has a one-in-four chance of immobility."
  },
  {
    Move: "Thunderbolt",
    Type: "Electric",
    Power: 95,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "An ELECTRIC-type attack. Has a one-in-ten chance of paralyzing the target."
  },
  {
    Move: "Counter",
    Type: "Fighting",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "A retaliation move that pays back double the damage of a physical attack. Highly accurate."
  },
  {
    Move: "Double Kick",
    Type: "Fighting",
    Power: 30,
    Accuracy: 100,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A FIGHTING-type attack. As the name implies, it is actually two quick kicks in succession."
  },
  {
    Move: "Hi Jump Kick",
    Type: "Fighting",
    Power: 85,
    Accuracy: 90,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Stronger than a JUMP KICK. If it misses, the attacker sustains 1/8 the damage it should have caused."
  },
  {
    Move: "Jump Kick",
    Type: "Fighting",
    Power: 70,
    Accuracy: 95,
    PP: 25,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A forceful FIGHTING-type attack. If it misses, however, the attacker gets hurt."
  },
  {
    Move: "Low Kick",
    Type: "Fighting",
    Power: 50,
    Accuracy: 90,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A FIGHTING-type attack. Has a one-in-three chance of making the target flinch if it connects."
  },
  {
    Move: "Rolling Kick",
    Type: "Fighting",
    Power: 60,
    Accuracy: 85,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A sharp FIGHTING-type attack. Has a one-in-three chance of making the target flinch if it connects."
  },
  {
    Move: "Seismic Toss",
    Type: "Fighting",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "A FIGHTING-type attack. Throws the target with enough force to flip the world upside down."
  },
  {
    Move: "Submission",
    Type: "Fighting",
    Power: 80,
    Accuracy: 80,
    PP: 25,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The strongest FIGHTING attack. One quarter of the damage it inflicts comes back to hurt the attacker."
  },
  {
    Move: "Ember",
    Type: "Fire",
    Power: 40,
    Accuracy: 100,
    PP: 25,
    Category: "Special",
    CategoryST: "Special",
    Description: "A FIRE-type attack. Has a one-in-ten chance of leaving the target with a damaging burn."
  },
  {
    Move: "Fire Blast",
    Type: "Fire",
    Power: 120,
    Accuracy: 85,
    PP: 5,
    Category: "Special",
    CategoryST: "Special",
    Description: "The strongest FIRE-type attack. Has a one-in-three chance of inflicting a burn on the target."
  },
  {
    Move: "Fire Punch",
    Type: "Fire",
    Power: 75,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A special FIRE-type attack. Has a one-in-ten chance of inflicting a burn on the target."
  },
  {
    Move: "Fire Spin",
    Type: "Fire",
    Power: 15,
    Accuracy: 70,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A FIRE-type attack that lasts two to five turns. The target cannot move while surrounded by flames."
  },
  {
    Move: "Flamethrower",
    Type: "Fire",
    Power: 95,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A powerful FIRE-type attack. Has a one-in-ten chance of leaving the target with a damaging burn."
  },
  {
    Move: "Drill Peck",
    Type: "Flying",
    Power: 80,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A standard FLYING-type attack. It is strong and highly likely to hit the target."
  },
  {
    Move: "Fly",
    Type: "Flying",
    Power: 70,
    Accuracy: 95,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The Pokémon flies high, then strikes in the next turn. Used for flying to places already visited."
  },
  {
    Move: "Mirror Move",
    Type: "Flying",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Misc",
    Description: "A move that strikes back with the opponent's last move. This move comes after the enemy's move."
  },
  {
    Move: "Peck",
    Type: "Flying",
    Power: 35,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A standard FLYING-type attack. It is favored by Pokémon that have beaks and/or horns."
  },
  {
    Move: "Sky Attack",
    Type: "Flying",
    Power: 140,
    Accuracy: 90,
    PP: 5,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The strongest FLYING-type attack. Energy is stored in the first turn, then fired the next turn."
  },
  {
    Move: "Wing Attack",
    Type: "Flying",
    Power: 35,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A FLYING-type attack. The attacking Pokémon spreads its wings and charges at the target."
  },
  {
    Move: "Confuse Ray",
    Type: "Ghost",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Status",
    Description: "A sinister flash of light makes the target confused. A special GHOST-type technique."
  },
  {
    Move: "Lick",
    Type: "Ghost",
    Power: 20,
    Accuracy: 100,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A GHOST-type attack. Has a one-in-three chance of leaving the target with paralysis."
  },
  {
    Move: "Night Shade",
    Type: "Ghost",
    Power: "-",
    Accuracy: 100,
    PP: 15,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "A GHOST-type attack. Highly accurate, it inflicts damage regardless of the target's type."
  },
  {
    Move: "Absorb",
    Type: "Grass",
    Power: 20,
    Accuracy: 100,
    PP: 20,
    Category: "Special",
    CategoryST: "Special",
    Description: "A GRASS-type attack. It adds half the HP it drained from the target to the attacker's HP."
  },
  {
    Move: "Leech Seed",
    Type: "Grass",
    Power: "-",
    Accuracy: 90,
    PP: 10,
    Category: "Status",
    CategoryST: "Status",
    Description: "Plants a seed on the target Pokémon. The seed slowly drains the target's HP for the attacker."
  },
  {
    Move: "Mega Drain",
    Type: "Grass",
    Power: 40,
    Accuracy: 100,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "A GRASS-type attack. It adds half the HP it drained from the target to the attacker's HP."
  },
  {
    Move: "Petal Dance",
    Type: "Grass",
    Power: 70,
    Accuracy: 100,
    PP: 20,
    Category: "Special",
    CategoryST: "Special",
    Description: "A dance-like attack that lasts two to three turns. Afterwards, the attacker becomes confused."
  },
  {
    Move: "Razor Leaf",
    Type: "Grass",
    Power: 55,
    Accuracy: 95,
    PP: 25,
    Category: "Special",
    CategoryST: "Special",
    Description: "A GRASS-type attack that sends sharp-edged leaves at the target. Likely to get a critical hit."
  },
  {
    Move: "Sleep Powder",
    Type: "Grass",
    Power: "-",
    Accuracy: 75,
    PP: 15,
    Category: "Status",
    CategoryST: "Status",
    Description: "Induces sleep. A Pokémon will stay asleep for several turns if an item isn't used to wake it."
  },
  {
    Move: "Solarbeam",
    Type: "Grass",
    Power: 120,
    Accuracy: 100,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "The strongest GRASS-type attack. Energy is absorbed in the first turn, then fired the next turn."
  },
  {
    Move: "Spore",
    Type: "Grass",
    Power: "-",
    Accuracy: 100,
    PP: 15,
    Category: "Status",
    CategoryST: "Status",
    Description: "Special spores are scattered from mushrooms. If the opponent inhales the spores, it will fall asleep."
  },
  {
    Move: "Stun Spore",
    Type: "Grass",
    Power: "-",
    Accuracy: 75,
    PP: 30,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special move that causes paralysis. When paralyzed, the victim has a one-in-four chance of immobility."
  },
  {
    Move: "Vine Whip",
    Type: "Grass",
    Power: 35,
    Accuracy: 100,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "A GRASS-type attack. The Pokémon uses its cruel whips to strike the opponent."
  },
  {
    Move: "Bone Club",
    Type: "Ground",
    Power: 65,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A physical attack using a bone as a club. If it connects, it may cause the target to flinch."
  },
  {
    Move: "Bonemerang",
    Type: "Ground",
    Power: 50,
    Accuracy: 90,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A boomerang made of bone is thrown to inflict damage twice - on the way out and on its return."
  },
  {
    Move: "Dig",
    Type: "Ground",
    Power: 100,
    Accuracy: 100,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The attacker digs underground in the first turn, then pops up in the next turn to attack."
  },
  {
    Move: "Earthquake",
    Type: "Ground",
    Power: 100,
    Accuracy: 100,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An attack that inflicts damage by shaking the ground. It is useless against FLYING-type Pokémon."
  },
  {
    Move: "Fissure",
    Type: "Ground",
    Power: "-",
    Accuracy: 30,
    PP: 5,
    Category: "OHKO",
    CategoryST: "OHKO",
    Description: "Causes a single-hit knockout if it hits. Useless against FLYING-type Pokémon."
  },
  {
    Move: "Aurora Beam",
    Type: "Ice",
    Power: 65,
    Accuracy: 100,
    PP: 20,
    Category: "Special",
    CategoryST: "Special",
    Description: "An ICE-type attack. Has a one-in-three chance of reducing the target's ATTACK power."
  },
  {
    Move: "Blizzard",
    Type: "Ice",
    Power: 120,
    Accuracy: 90,
    PP: 5,
    Category: "Special",
    CategoryST: "Special",
    Description: "The strongest ICE-type attack. Has a one-in-ten chance of freezing the target solid."
  },
  {
    Move: "Haze",
    Type: "Ice",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Eliminates all changes affecting status, such as SPEED and accuracy, of both Pokémon in battle."
  },
  {
    Move: "Ice Beam",
    Type: "Ice",
    Power: 95,
    Accuracy: 100,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "An ICE-type attack. Has a one-in-ten chance of freezing the target solid."
  },
  {
    Move: "Ice Punch",
    Type: "Ice",
    Power: 75,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A special ICE-type attack. Has a one-in-ten chance of freezing the target."
  },
  {
    Move: "Mist",
    Type: "Ice",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Status",
    Description: "Provides full protection against any enemy status attack, such as those that lower DEFENSE."
  },
  {
    Move: "Barrage",
    Type: "Normal",
    Power: 15,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Several spheres are thrown consecutively at the target to inflict damage."
  },
  {
    Move: "Bide",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "The user waits for several turns. At the end, it returns double the damage it received."
  },
  {
    Move: "Bind",
    Type: "Normal",
    Power: 15,
    Accuracy: 74.6,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Traps and squeezes the target over several turns. The target cannot move while under attack."
  },
  {
    Move: "Bite",
    Type: "Normal",
    Power: 60,
    Accuracy: 100,
    PP: 25,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A bite made using sharp fangs. This may cause the opponent to flinch, and it might not attack."
  },
  {
    Move: "Body Slam",
    Type: "Normal",
    Power: 85,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Has a one-in-three chance of paralyzing the target if it connects."
  },
  {
    Move: "Comet Punch",
    Type: "Normal",
    Power: 18,
    Accuracy: 85,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Although each slap is weak, this attack hits the target two to five times in succession."
  },
  {
    Move: "Constrict",
    Type: "Normal",
    Power: 10,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Has a one-in-three chance of reducing the target's SPEED."
  },
  {
    Move: "Conversion",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Misc",
    Description: "A special move that switches the user's elemental type to that of the target."
  },
  {
    Move: "Cut",
    Type: "Normal",
    Power: 50,
    Accuracy: 95,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Also used for cutting small bushes to open new paths."
  },
  {
    Move: "Defense Curl",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Raises the user's DEFENSE. Can normally be used up to six times in a row."
  },
  {
    Move: "Disable",
    Type: "Normal",
    Power: "-",
    Accuracy: 55,
    PP: 20,
    Category: "Status",
    CategoryST: "Misc",
    Description: "A technique that disables one of the target's moves. The disabled move can't be used until it wears off."
  },
  {
    Move: "Dizzy Punch",
    Type: "Normal",
    Power: 70,
    Accuracy: 100,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. The punch is relatively strong and highly accurate."
  },
  {
    Move: "Doubleslap",
    Type: "Normal",
    Power: 15,
    Accuracy: 85,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Although each slap is weak, this attack hits the target two to five times in succession."
  },
  {
    Move: "Double Team",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 15,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Creates illusionary copies of the user. The copies disorient the enemy, reducing its accuracy."
  },
  {
    Move: "Double-Edge",
    Type: "Normal",
    Power: 100,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A charging tackle attack. One quarter of the damage it inflicts comes back to hurt the attacker."
  },
  {
    Move: "Egg Bomb",
    Type: "Normal",
    Power: 100,
    Accuracy: 75,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. An egg is launched at the target. It may miss, however."
  },
  {
    Move: "Explosion",
    Type: "Normal",
    Power: 170,
    Accuracy: 100,
    PP: 5,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The most powerful attack of all. However, the attacker faints after using this move."
  },
  {
    Move: "Flash",
    Type: "Normal",
    Power: "-",
    Accuracy: 70,
    PP: 20,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Creates a brilliant flash of light that blinds the target. This technique reduces the opponent's accuracy."
  },
  {
    Move: "Focus Energy",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Raises the likelihood of nailing the opponent's weak spot for a critical hit."
  },
  {
    Move: "Fury Attack",
    Type: "Normal",
    Power: 15,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. The Pokémon rapidly jabs at its opponent several times."
  },
  {
    Move: "Fury Swipes",
    Type: "Normal",
    Power: 18,
    Accuracy: 80,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The target is scratched by sharp claws two to five times in quick succession."
  },
  {
    Move: "Glare",
    Type: "Normal",
    Power: "-",
    Accuracy: 75,
    PP: 30,
    Category: "Status",
    CategoryST: "Status",
    Description: "The target is transfixed with terrifying sharp eyes. The target is frightened into paralysis."
  },
  {
    Move: "Growl",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A technique that lowers the target's ATTACK power. Can normally be used up to six times."
  },
  {
    Move: "Growth",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Raises SPECIAL to make special attacks stronger and enhance protection against special moves."
  },
  {
    Move: "Guillotine",
    Type: "Normal",
    Power: "-",
    Accuracy: 30,
    PP: 5,
    Category: "OHKO",
    CategoryST: "OHKO",
    Description: "A single-hit knockout attack. Learned only by Pokémon that have large pincers."
  },
  {
    Move: "Gust",
    Type: "Normal",
    Power: 40,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack used by bird Pokémon. A powerful wind is generated by flapping wings."
  },
  {
    Move: "Harden",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Raises the user's DEFENSE. Useful when battling physically strong Pokémon."
  },
  {
    Move: "Headbutt",
    Type: "Normal",
    Power: 70,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Has a one-in-three chance of making the target flinch if it connects."
  },
  {
    Move: "Horn Attack",
    Type: "Normal",
    Power: 65,
    Accuracy: 100,
    PP: 25,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. A sharp horn is driven hard into the target to inflict damage."
  },
  {
    Move: "Horn Drill",
    Type: "Normal",
    Power: "-",
    Accuracy: 30,
    PP: 5,
    Category: "OHKO",
    CategoryST: "OHKO",
    Description: "A single-hit knockout attack. Learned only by Pokémon with a horn or horns."
  },
  {
    Move: "Hyper Beam",
    Type: "Normal",
    Power: 150,
    Accuracy: 90,
    PP: 5,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An extremely powerful attack. The attacker becomes so tired, it has to rest the next turn."
  },
  {
    Move: "Hyper Fang",
    Type: "Normal",
    Power: 80,
    Accuracy: 90,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Has a one-in-ten chance of making the target flinch."
  },
  {
    Move: "Karate Chop",
    Type: "Normal",
    Power: 50,
    Accuracy: 100,
    PP: 25,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Often turns into a critical hit and inflicts double the damage."
  },
  {
    Move: "Leer",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A technique that lowers the target's DEFENSE. Useful against tough, armored Pokémon."
  },
  {
    Move: "Lovely Kiss",
    Type: "Normal",
    Power: "-",
    Accuracy: 75,
    PP: 10,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special move that puts the target to sleep with a big kiss. (Actually, the victim passes out.)"
  },
  {
    Move: "Mega Kick",
    Type: "Normal",
    Power: 120,
    Accuracy: 74.6,
    PP: 5,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Out of all the Pokémon kicking attacks, this is the strongest."
  },
  {
    Move: "Mega Punch",
    Type: "Normal",
    Power: 80,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack move. It is highly accurate and relatively powerful."
  },
  {
    Move: "Metronome",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Misc",
    Description: "The user waggles its finger, triggering a move. There is no telling what will happen."
  },
  {
    Move: "Mimic",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Misc",
    Description: "A move for learning one of the opponent's moves, for use during that battle only."
  },
  {
    Move: "Minimize",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Reduces the user's size and makes it harder to hit. Can normally be used up to six times."
  },
  {
    Move: "Pay Day",
    Type: "Normal",
    Power: 40,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A move that also nets money at the end of battle. How much depends on the attack frequency and level."
  },
  {
    Move: "Pound",
    Type: "Normal",
    Power: 40,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Slightly stronger than TACKLE. Many Pokémon know this move."
  },
  {
    Move: "Quick Attack",
    Type: "Normal",
    Power: 40,
    Accuracy: 100,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An attack that always strikes first. If both Pokémon use this, the one with higher SPEED attacks first."
  },
  {
    Move: "Rage",
    Type: "Normal",
    Power: 20,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A non-stop attack move. The user's ATTACK power increases every time it sustains damage."
  },
  {
    Move: "Razor Wind",
    Type: "Normal",
    Power: 80,
    Accuracy: 74.6,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A two-turn attack with the wind attack in the second turn. Learned by many FLYING-type Pokémon."
  },
  {
    Move: "Recover",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Heal",
    Description: "Restores HP by 1/2 of the user's maximum HP. Few Pokémon learn this technique on their own."
  },
  {
    Move: "Roar",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Bad",
    Description: "A terrifying roar that drives wild Pokémon away. It is useful only in the wild."
  },
  {
    Move: "Sand-Attack",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 15,
    Category: "Status",
    CategoryST: "Stat",
    Description: "An attack in which sand is used to blind the target and reduce its attack accuracy."
  },
  {
    Move: "Scratch",
    Type: "Normal",
    Power: 40,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Sharp claws are used to inflict damage on the target."
  },
  {
    Move: "Screech",
    Type: "Normal",
    Power: "-",
    Accuracy: 85,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A move that makes a horrible noise. It sharply reduces the target's DEFENSE."
  },
  {
    Move: "Selfdestruct",
    Type: "Normal",
    Power: 130,
    Accuracy: 100,
    PP: 5,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "The user explodes, inflicting damage on the enemy, then faints. Useless against GHOST-type."
  },
  {
    Move: "Sharpen",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Raises the user's ATTACK power. The edges of the Pokémon are made harder for more impact."
  },
  {
    Move: "Sing",
    Type: "Normal",
    Power: "-",
    Accuracy: 55,
    PP: 15,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special NORMAL-type technique. A soothing melody lulls the target to sleep."
  },
  {
    Move: "Skull Bash",
    Type: "Normal",
    Power: 100,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "In the first turn, the attacker tucks in its head. The next turn, it head-butts at full steam."
  },
  {
    Move: "Slam",
    Type: "Normal",
    Power: 80,
    Accuracy: 74.6,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack move. The attacker uses an appendage (e.g. tail) to slam the target hard."
  },
  {
    Move: "Slash",
    Type: "Normal",
    Power: 70,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. It has a high probability of a critical hit for inflicting double the damage."
  },
  {
    Move: "Smokescreen",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Creates an obscuring cloud of smoke that reduces the enemy's accuracy."
  },
  {
    Move: "Softboiled",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Heal",
    Description: "Restores HP by 1/2 of the user's maximum HP. May also be used in the field."
  },
  {
    Move: "Sonicboom",
    Type: "Normal",
    Power: "-",
    Accuracy: 90,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. It inflicts a set amount of damage regardless of the target's type."
  },
  {
    Move: "Spike Cannon",
    Type: "Normal",
    Power: 20,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A physical attack consisting of two to five consecutive hits. Highly accurate."
  },
  {
    Move: "Splash",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Bad",
    Description: "A move that involves only flopping and SPLASHing around in front of the opponent. It has no effect."
  },
  {
    Move: "Stomp",
    Type: "Normal",
    Power: 65,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Has a one-in-three chance of making the target flinch if it connects."
  },
  {
    Move: "Strength",
    Type: "Normal",
    Power: 80,
    Accuracy: 100,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A very powerful NORMAL-type attack. Also used for moving obstacles like boulders."
  },
  {
    Move: "Struggle",
    Type: "Normal",
    Power: 50,
    Accuracy: 100,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Used only if the user runs totally out of PP. The user is hit with 1/4 of the damage it inflicts."
  },
  {
    Move: "Substitute",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Misc",
    Description: "Uses 1/4 of the user's maximum HP to create a substitute that takes the opponent's attacks."
  },
  {
    Move: "Super Fang",
    Type: "Normal",
    Power: "-",
    Accuracy: 90,
    PP: 10,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "If it hits, this attack cuts the target's HP in half. Learned by Pokémon with developed fangs."
  },
  {
    Move: "Supersonic",
    Type: "Normal",
    Power: "-",
    Accuracy: 55,
    PP: 20,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special NORMAL-type technique. Supersonic sound waves are used to confuse the target."
  },
  {
    Move: "Swift",
    Type: "Normal",
    Power: 60,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. It is highly accurate, so it can be counted on to inflict damage."
  },
  {
    Move: "Swords Dance",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A special move that greatly boosts the user's ATTACK power. Can normally be used up to three times."
  },
  {
    Move: "Tackle",
    Type: "Normal",
    Power: 35,
    Accuracy: 95,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. Many Pokémon know this attack right from the start."
  },
  {
    Move: "Tail Whip",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A technique that lowers the target's DEFENSE. Useful against tough, armored Pokémon."
  },
  {
    Move: "Take Down",
    Type: "Normal",
    Power: 90,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A charging attack. One quarter of the damage it inflicts comes back to hurt the attacker."
  },
  {
    Move: "Thrash",
    Type: "Normal",
    Power: 90,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "An attack that lasts two to three turns. Afterwards, the attacker becomes confused."
  },
  {
    Move: "Transform",
    Type: "Normal",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Misc",
    Description: "Transforms the user into a copy of the target, including the type. All moves have only five PP each."
  },
  {
    Move: "Tri Attack",
    Type: "Normal",
    Power: 80,
    Accuracy: 100,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack. A triangular field of energy is created and launched at the target."
  },
  {
    Move: "Vice Grip",
    Type: "Normal",
    Power: 55,
    Accuracy: 100,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A NORMAL-type attack used only by Pokémon with pincers. The target is gripped and injured."
  },
  {
    Move: "Whirlwind",
    Type: "Normal",
    Power: "-",
    Accuracy: 85,
    PP: 20,
    Category: "Status",
    CategoryST: "Bad",
    Description: "Generates a powerful wind that blows away wild Pokémon. Useful in the wild only."
  },
  {
    Move: "Wrap",
    Type: "Normal",
    Power: 15,
    Accuracy: 85,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Traps and squeezes the target over two to five turns. The target cannot move while under attack."
  },
  {
    Move: "Acid",
    Type: "Poison",
    Power: 40,
    Accuracy: 100,
    PP: 30,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A POISON-type attack. Has a one-in-three chance of lowering the target's DEFENSE."
  },
  {
    Move: "Acid Armor",
    Type: "Poison",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Melts the user's body for protection. A move that sharply raises DEFENSE."
  },
  {
    Move: "Poison Gas",
    Type: "Poison",
    Power: "-",
    Accuracy: 55,
    PP: 40,
    Category: "Status",
    CategoryST: "Status",
    Description: "A poisonous cloud of gas is forcefully expelled to poison the target."
  },
  {
    Move: "Poisonpowder",
    Type: "Poison",
    Power: "-",
    Accuracy: 74.6,
    PP: 35,
    Category: "Status",
    CategoryST: "Status",
    Description: "A technique that poisons the target. If poisoned, the victim loses HP steadily."
  },
  {
    Move: "Poison Sting",
    Type: "Poison",
    Power: 15,
    Accuracy: 100,
    PP: 35,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A POISON-type attack. Has a one-in- five chance of leaving the target with the lingering effects of poison."
  },
  {
    Move: "Sludge",
    Type: "Poison",
    Power: 65,
    Accuracy: 100,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A POISON-type attack. Has a fifty-fifty chance of poisoning the target."
  },
  {
    Move: "Smog",
    Type: "Poison",
    Power: 20,
    Accuracy: 70,
    PP: 20,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "Smog is spewed as a cloud. Has a fifty-fifty chance of poisoning the target."
  },
  {
    Move: "Toxic",
    Type: "Poison",
    Power: "-",
    Accuracy: 85,
    PP: 10,
    Category: "Status",
    CategoryST: "Status",
    Description: "A technique that badly poisons the target. The amount of damage from the poison increases every turn."
  },
  {
    Move: "Agility",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A special technique that greatly boosts the user's SPEED. Can normally be used up to three times."
  },
  {
    Move: "Amnesia",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Sharply raises the user's SPECIAL stat. Also increases protection against special attacks."
  },
  {
    Move: "Barrier",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Instantly forms a barrier between the user and the opponent. DEFENSE is sharply increased."
  },
  {
    Move: "Confusion",
    Type: "Psychic",
    Power: 50,
    Accuracy: 100,
    PP: 25,
    Category: "Special",
    CategoryST: "Special",
    Description: "A PSYCHIC-type attack. Has a one-in-ten chance of leaving the target confused."
  },
  {
    Move: "Dream Eater",
    Type: "Psychic",
    Power: 100,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "Works only on sleeping Pokémon. This technique steals the target's HP and adds it to the user's HP."
  },
  {
    Move: "Hypnosis",
    Type: "Psychic",
    Power: "-",
    Accuracy: 59.8,
    PP: 20,
    Category: "Status",
    CategoryST: "Status",
    Description: "A special PSYCHIC-type move. The target is hypnotized into a deep sleep."
  },
  {
    Move: "Kinesis",
    Type: "Psychic",
    Power: "-",
    Accuracy: 80,
    PP: 15,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A special move of bending spoons to confound the enemy. Makes the user harder to hit."
  },
  {
    Move: "Light Screen",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 30,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Reduces damage from special attacks by about half. A special PSYCHIC-type technique."
  },
  {
    Move: "Meditate",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Stat",
    Description: "A special technique that boosts the user's ATTACK power. Can normally be used up to six times."
  },
  {
    Move: "Psybeam",
    Type: "Psychic",
    Power: 65,
    Accuracy: 100,
    PP: 20,
    Category: "Special",
    CategoryST: "Special",
    Description: "A PSYCHIC-type attack. Has a one-in-ten chance of making the target confused."
  },
  {
    Move: "Psychic",
    Type: "Psychic",
    Power: 90,
    Accuracy: 100,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "A PSYCHIC-type attack. Has a one-in-three chance of lowering the target's SPECIAL rating."
  },
  {
    Move: "Psywave",
    Type: "Psychic",
    Power: "-",
    Accuracy: 80,
    PP: 15,
    Category: "Fixed",
    CategoryST: "Fixed",
    Description: "A PSYCHIC-type attack of varying intensity. It occasionally inflicts heavy damage."
  },
  {
    Move: "Reflect",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Stat",
    Description: "Reduces damage from physical attacks by about half. A special PSYCHIC-type technique."
  },
  {
    Move: "Rest",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 10,
    Category: "Status",
    CategoryST: "Heal",
    Description: "The user takes a nap to fully restore its HP and recover from any status abnormalities."
  },
  {
    Move: "Teleport",
    Type: "Psychic",
    Power: "-",
    Accuracy: 100,
    PP: 20,
    Category: "Status",
    CategoryST: "Bad",
    Description: "A special technique for instantly escaping from wild Pokémon. Useful in the wild only."
  },
  {
    Move: "Rock Slide",
    Type: "Rock",
    Power: 75,
    Accuracy: 90,
    PP: 10,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A ROCK-type attack that hits the target with an avalanche of rocks and boulders."
  },
  {
    Move: "Rock Throw",
    Type: "Rock",
    Power: 50,
    Accuracy: 65,
    PP: 15,
    Category: "Physical",
    CategoryST: "Physical",
    Description: "A ROCK-type attack. As the name implies, a huge boulder is dropped on the target."
  },
  {
    Move: "Bubble",
    Type: "Water",
    Power: 20,
    Accuracy: 100,
    PP: 30,
    Category: "Special",
    CategoryST: "Special",
    Description: "A WATER-type attack. Has a one-in-three chance of reducing the target's SPEED."
  },
  {
    Move: "Bubblebeam",
    Type: "Water",
    Power: 65,
    Accuracy: 100,
    PP: 20,
    Category: "Special",
    CategoryST: "Special",
    Description: "A WATER-type attack. Has a one-in-three chance of reducing the target's SPEED."
  },
  {
    Move: "Clamp",
    Type: "Water",
    Power: 35,
    Accuracy: 75,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "The target is gripped in the attacker's shell for two to five turns. It can't move while under attack."
  },
  {
    Move: "Crabhammer",
    Type: "Water",
    Power: 90,
    Accuracy: 85,
    PP: 10,
    Category: "Special",
    CategoryST: "Special",
    Description: "A move that is used only by Pokémon with pincers. Likely to get a critical hit."
  },
  {
    Move: "Hydro Pump",
    Type: "Water",
    Power: 120,
    Accuracy: 80,
    PP: 5,
    Category: "Special",
    CategoryST: "Special",
    Description: "The strongest WATER-type attack. However, while it is powerful, it may miss the target."
  },
  {
    Move: "Surf",
    Type: "Water",
    Power: 95,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A WATER-type attack. The power of this technique is strong and highly accurate."
  },
  {
    Move: "Water Gun",
    Type: "Water",
    Power: 40,
    Accuracy: 100,
    PP: 25,
    Category: "Special",
    CategoryST: "Special",
    Description: "A WATER-type attack. Stronger than BUBBLE. Many WATER-type Pokémon learn this move."
  },
  {
    Move: "Waterfall",
    Type: "Water",
    Power: 80,
    Accuracy: 100,
    PP: 15,
    Category: "Special",
    CategoryST: "Special",
    Description: "A WATER-type attack. The target is hit with a blow packing the power of fish traveling up waterfalls."
  },
  {
    Move: "Withdraw",
    Type: "Water",
    Power: "-",
    Accuracy: 100,
    PP: 40,
    Category: "Status",
    CategoryST: "Status",
    Description: "Used mainly by Pokémon with shells. By withdrawing into the shell, DEFENSE is increased."
  },
  {
    Move: " ",
    Type: " ",
    Power: " ",
    Accuracy: " ",
    PP: " ",
    Category: " ",
    CategoryST: " ",
    Description: " "
  }
]