## react-rpg-dice

Click a die button to roll a die. Click multiple times to roll multiple dice.

Live Demo:

[default](https://stackblitz.com/edit/vitejs-vite-gaeadw?file=src%2FApp.tsx)

[vertical orientation](https://stackblitz.com/edit/vitejs-vite-huuwb5?file=src%2FApp.tsx)

[custom dice](https://stackblitz.com/edit/vitejs-vite-ruyevq?file=src%2FApp.tsx)

[custom timeouts](https://stackblitz.com/edit/vitejs-vite-m4g3pw?file=src%2FApp.tsx)

[custom roll function](https://stackblitz.com/edit/vitejs-vite-srarwc?file=src%2FApp.tsx)

<img width="513" alt="image" src="https://github.com/user-attachments/assets/2ea482f4-30e9-45a0-a4ea-3e6840ae214c">


| Option              | Description                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| callback (required) | function called with results of rolls (type Result = { result: number, sides: number, bonus: number }) |
| orientation         | 'horizontal' (default) or 'vertical'                                                                   |
| dice                | array of what sided dice (default [ 4, 6, 8, 10, 12, 20 ])                                             |
| defaultTimeout      | how long to wait for additional dice before rolling                                                    |
| timeoutMultipliers  | multiplies defaultTimeout after certain numbers of dice in queue                                       |
| diceRollFn          | roll calculator override                                                                               |
