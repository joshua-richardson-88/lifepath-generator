// race select section elements
const raceCheckbox = document.getElementById('race-checkbox');
const generateSection = document.getElementById('race-gen');
const raceRollBtn = document.getElementById('race-roll-btn');
const raceRollDisplay = document.getElementById('race-roll-display');
const chooseSection = document.getElementById('race-choose');
const bonusStat = document.getElementById('bonus-stat');
const raceStatSelect = document.getElementById('race-stat-select');
const raceStatValue = document.getElementById('race-stat-value');
const raceSelect = document.getElementById('race-select');

// path section elements
const academicBtn = document.getElementById('academic');
const wandererBtn = document.getElementById('wanderer');
const soldierBtn = document.getElementById('soldier');
const pathDisplay = document.getElementById('path');
const MAX_RUNS = 16;

// stats elements
const statsDisplay = document.getElementById('attributes');
const classDisplay = document.getElementById('class-display');

// player record
const player = {
  race: {},
  statName: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
  baseStats: [10, 10, 10, 10, 10, 10],
  currentStats: [10, 10, 10, 10, 10, 10],
  trueClass: [],
  possibleClass: [],
  events: [],
};

// display the race generator or race selector
raceCheckbox.addEventListener('click', (event) => {
  if (event.target.checked) {
    generateSection.classList.add('hide');
    chooseSection.classList.remove('hide');
  } else {
    generateSection.classList.remove('hide');
    chooseSection.classList.add('hide');
  }
  if (!bonusStat.classList.contains('hide')) {
    bonusStat.classList.add('hide');
  }
  player.race = {};
});

// generate race
raceRollBtn.addEventListener('click', (event) => {
  const roll = Math.floor(Math.random() * data.race.length);
  const p = document.createElement('span');
  p.innerText = `Congratulations, its a ${data.race[roll].name}!`;

  player.race = { ...data.race[roll] };

  // for anything that has the 'pick a stat' section
  if (player.race.stats[6] > 0) {
    let stat;
    for (let i = 0; i < player.race.stats.length - 1; i++) {
      console.log(player.race.stats[i]);
      if (player.race.stats[i] > 0) stat = i + 1;
    }
    for (let i = 0; i < raceStatSelect.options.length; i++) {
      raceStatSelect.options[i].disabled = i === stat ? true : false;
    }

    if (bonusStat.classList.contains('hide')) bonusStat.classList.remove('hide');
  } else {
    // make sure the bonus stat select is hidden unless we need it
    if (!bonusStat.classList.contains('hide')) bonusStat.classList.add('hide');
  }

  raceRollDisplay.innerHTML = '';
  raceRollDisplay.appendChild(p);
  updatePlayer();
});

// choose race
raceSelect.addEventListener('change', (event) => {
  const selected = event.target.options[event.target.selectedIndex].value;
  player.race = selected !== '$' ? { ...data.race[selected] } : {};
  if (player.race.stats[6] > 0) {
    let stat;
    for (let i = 0; i < player.race.stats.length - 1; i++) {
      console.log(player.race.stats[i]);
      if (player.race.stats[i] > 0) stat = i + 1;
    }
    for (let i = 0; i < raceStatSelect.options.length; i++) {
      raceStatSelect.options[i].disabled = i === stat ? true : false;
    }

    if (bonusStat.classList.contains('hide')) bonusStat.classList.remove('hide');
  } else {
    // make sure the bonus stat select is hidden unless we need it
    if (!bonusStat.classList.contains('hide')) bonusStat.classList.add('hide');
  }
  updatePlayer();
});

// for races with bonus picker, listen to the select
raceStatSelect.addEventListener('change', (event) => {
  const choice = event.target.options[event.target.selectedIndex].value;
  player.race.choice = choice !== '$' ? choice : null;
  updatePlayer();
});

// update player stats
const updatePlayer = () => {
  player.currentStats = player.baseStats.slice();
  player.trueClass = [];
  player.possibleClass = [];
  // if there was a choice in the player's racial bonus
  if (player.race.name && player.race.choice) {
    // reset race bonus
    player.race.stats = data.race[player.race.id].stats.slice();
    // increase the chosen stat by the race's bonus
    player.race.stats[player.race.choice] = player.race.stats[6];
  }
  // redundant with above, but wanted this to only run when
  // race had been chosen
  if (player.race.name) addStats(player.race.stats);

  if (player.events.length > 0) {
    // add all the stats from events up and add to player
    player.events.forEach((choice) => addStats(choice.stats));
    // sort the stats
    let highestInd = 0;
    let highestStat = 0;
    let secondInd = 0;
    let secondStat = 0;
    player.currentStats.forEach((el, index) => {
      if (el > highestStat) {
        highestStat = el;
        highestInd = index;
      }
    });
    player.currentStats.forEach((el, index) => {
      if (el < highestStat && el > secondStat) {
        secondStat = el;
        secondInd = index;
      }
    });

    if (highestStat > 20) {
      lifePath(player.choice);
    }
    // figure out which class is best for the player
    for (let i = 0; i < data.class.length; i++) {
      if (data.class[i].stat1 === highestInd && data.class[i].stat2 === secondInd) {
        player.trueClass.push(data.class[i].name);
      } else if (data.class[i].stat1 === highestInd && data.class[i].stat2 !== secondInd) {
        player.possibleClass.push(data.class[i].name);
      }
    }
  }
  // reset the DOM
  statsDisplay.innerHTML = '';
  classDisplay.innerHTML = '';

  // add the elements to the stats DOM node
  for (let i = 0; i < player.baseStats.length; i++) {
    const p = document.createElement('p');
    p.innerText = `${player.statName[i]}: ${player.currentStats[i]}`;
    statsDisplay.appendChild(p);
  }

  // add the elements to the class DOM node
  if (player.trueClass.length > 0) {
    const p = document.createElement('p');
    let string = 'A perfect class fit for this character is: ';
    for (let i = 0; i < player.trueClass.length; i++) {
      if (player.trueClass.length === 1) {
        string += player.trueClass[i];
      } else if (i < player.trueClass.length - 1) {
        string += player.trueClass[i] + ', ';
      } else {
        string += `and ${player.trueClass[i]}`;
      }

      p.innerText = string;
      classDisplay.appendChild(p);
    }
  }
  if (player.possibleClass.length > 0) {
    const p = document.createElement('p');
    let string = 'A class that is a close fit for this character is: ';
    for (let i = 0; i < player.possibleClass.length; i++) {
      if (player.possibleClass.length === 1) {
        string += player.possibleClass[i];
      } else if (i < player.possibleClass.length - 1) {
        string += player.possibleClass[i] + ', ';
      } else {
        string += `and ${player.possibleClass[i]}`;
      }
      p.innerText = string;
      classDisplay.appendChild(p);
    }
  }
  console.log(player);
};

// add arrays together
const addStats = (arr) => {
  for (let i = 0; i < player.baseStats.length; i++) {
    player.currentStats[i] += arr[i];
  }
};

// update the choose race options
const updateRaceChoice = () => {
  raceSelect.innerHTML = '<option value="$">----------------------</option>';
  for (let i = 0; i < data.race.length; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = data.race[i].name;
    raceSelect.appendChild(option);
  }
};

// generate life path
const lifePath = (choice) => {
  let branch = choice;
  player.choice = choice;
  player.events = [];

  // add the events
  for (let i = 0; i < MAX_RUNS; i++) {
    const roll = Math.floor(Math.random() * data.path[branch].length);
    const event = data.path[branch][roll];
    player.events.push(event);
    if (event.jump !== 0) {
      branch = event.jump;
      i--;
    }
  }
  updatePlayer();
  updateDisplay();
};

const updateDisplay = () => {
  pathDisplay.innerHTML = '';
  let list1 = document.createElement('ul');
  let list2 = document.createElement('ul');
  let itemsInList = Math.floor(player.events.length / 2);
  itemsInList = player.events.length % 2 === 1 ? itemsInList + 1 : itemsInList;
  for (let i = 0; i < player.events.length; i++) {
    const item = document.createElement('li');
    item.innerText = player.events[i].text;
    i < itemsInList ? list1.appendChild(item) : list2.appendChild(item);
  }
  pathDisplay.appendChild(list1);
  pathDisplay.appendChild(list2);
};

// life path button listeners
academicBtn.addEventListener('click', () => lifePath('academic'));
wandererBtn.addEventListener('click', () => lifePath('wanderer'));
soldierBtn.addEventListener('click', () => lifePath('military'));

// when page loads, display base data and fill select
updatePlayer();
updateRaceChoice();
