# Codingame Solver

This extension can be used to pass Codingame exercise automatically.

Clone this repository, then open Google Chrome, go to `chrome://extensions` and [load the unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/)

## How it works

This is a Chrome extension with the usual three parts communicating with each other:

- extension popup active when clicked
- service worker running in the background
- content script injected on the webpage

### Coding challenge solving

- Click on the extension to open the popup
- Click the "Solve coding exercise" button from the extension popup
- Select the div containing the instructions
- enjoy

The extensions use the Chrome DevTools protocol to simulate user input in the text editor.

When the button is clicked:

- call the worker
- start debugger
- call the content script to start an element picker to select the instructions (Codingame randomize css class and IDs)
- use GPT-4 to stream code answer
- input key by key the answer (harder than you think, look at [typeText](https://github.com/Aschen/codingame-solver/blob/master/service-worker.js#L95))

### QCM solving

Roughly the same kind of workflow with the element picker but then the answer is simply displayed in the console.

### Generic question

Take the entire text body and try to find an answer to any question inside, then write the result in the console.

