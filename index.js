// Declare variables at the top
let apiKeyInput;
let apiKeyStatus;
let apiKey;

// Utility function to debounce rapid invocations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to retrieve an API key from storage
function retrieveApiKeyFromStorage() {
    chrome.storage.sync.get('apiKey', (result) => {
        apiKey = result.apiKey;
        updateApiKeyUI(apiKey);
    });
}

// Function to update the API key UI
function updateApiKeyUI(apiKey, apiKeyStatus) {
    const apiKeyInput = document.querySelector('#apiKeyInput');

    if (apiKeyInput && apiKeyStatus) {
        apiKeyInput.value = apiKey || '';
        apiKeyStatus.textContent = apiKey ? 'Got valid API key' : 'Invalid or no API key';
        apiKeyStatus.style.color = apiKey ? 'green' : 'red';
    }
}

// Function to validate and save an API key
// Function to validate and save an API key
function saveApiKey(apiKey, apiKeyStatus) {
    const apiUrl = 'https://api.openai.com/v1/engines/davinci/completions';
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            prompt: 'Test API key validity',
            max_tokens: 5,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid API key');
            }
            return chrome.storage.sync.set({apiKey});
        })
        .then(() => {
            updateApiKeyUI(apiKey, apiKeyStatus);
        })
        .catch(error => {
            if (apiKeyStatus) {
                apiKeyStatus.textContent = `API key verification failed: ${error.message}`;
                apiKeyStatus.style.color = 'red';
            }
            return chrome.storage.sync.remove('apiKey');
        });
}


// Event listeners and initialization
function init() {
    apiKeyInput = document.getElementById('apiKey');
    apiKeyStatus = document.getElementById('apiKeyStatus');
    document.getElementById('solveCoding').addEventListener('click', solveCodingFunc);
    document.getElementById('solveQCM').addEventListener('click', solveQCMFunc);
    document.getElementById('solveGeneric').addEventListener('click', solveGenericFunc);
    document.getElementById('resetApiKey').addEventListener('click', resetApiKeyFunc);
    apiKeyInput.addEventListener('input', debounce(handleApiKeyInput, 500));
    retrieveApiKeyFromStorage();
}

document.addEventListener('DOMContentLoaded', init);

// Functions to handle solving different types of problems
async function solveCodingFunc() {
    await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {type: "answer-coding"}, (response) => {
                resolve(response);
            });
    });
}

async function solveQCMFunc() {
    const choiceSelector = document.getElementById("choiceSelector").value;

    await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {type: "answer-qcm", selector: choiceSelector},
            (response) => {
                resolve(response);
            }
        );
    });
}

async function solveGenericFunc() {
    await new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {type: "answer-generic"}, (response) => {
                resolve(response);
            });
    });
}

// Function to handle API key input and debounce rapid invocations
function handleApiKeyInput(apiKeyStatus) {
    const apiKeyInput = document.querySelector('#apiKeyInput');
    const newApiKey = apiKeyInput ? apiKeyInput.value.trim() : undefined;
    const oldApiKey = apiKeyStatus && apiKeyStatus.textContent ? apiKeyStatus.textContent : '';
    if (newApiKey !== oldApiKey) {
        saveApiKey(newApiKey, apiKeyStatus)
            .catch(error => console.log('Error with saving API key: ', error));
    }
}

// Function to reset the API key
function resetApiKeyFunc() {
    chrome.storage.sync.remove('apiKey').then(() => {
        `API key removed`
    });
    if (apiKeyInput && apiKeyStatus) {
        apiKeyInput.value = '';
        apiKeyStatus.textContent = 'Invalid or no API key';
        apiKeyStatus.style.color = 'red';
    }
    apiKey = undefined;
}
