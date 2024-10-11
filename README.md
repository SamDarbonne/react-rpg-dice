## react-rpg-dice

Click a die button to roll a die. Click multiple times to roll multiple dice.

| Option              | Description                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| callback (required) | function called with results of rolls (type Result = { result: number, sides: number, bonus: number }) |
| orientation         | 'horizontal' (default) or 'vertical'                                                                   |
| dice                | array of what sided dice (default [ 4, 6, 8, 10, 12, 20 ])                                             |
| defaultTimeout      | how long to wait for additional dice before rolling                                                    |
| timeoutMultipliers  | multiplies defaultTimeout after certain numbers of dice in queue                                       |
| diceRollFn          | roll calculator override                                                                               |
