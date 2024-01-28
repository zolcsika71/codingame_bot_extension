let solveCodingElement = document.getElementById("solveCoding");
let solveQCMElement = document.getElementById("solveQCM");
let solveGenericElement = document.getElementById("solveGeneric");
let apiKeyInputElement = document.getElementById("apiKey");
let apiKeyStatusElement = document.getElementById("apiKeyStatus");
let resetApiKeyElement = document.getElementById("resetApiKey");
let choiceSelectorElement = document.getElementById("choicesSelector");

if (solveCodingElement) {
    solveCodingElement.addEventListener('click', async () => {
        let result;
        try {
            result = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({type: "answer-coding"}, (response) => {
                    if (response) {
                        resolve(response);
                    } else {
                        reject(new Error('No response received'));
                    }
                });
            });
            console.log(result);
        } catch (error) {
            console.error('Error in solveCoding:', error);
        }
    });
}
if (solveQCMElement && choiceSelectorElement) {
    solveQCMElement.addEventListener('click', async () => {
        let choiceSelector = choiceSelectorElement?.value;
        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({type: "answer-qcm", selector: choiceSelector}, (response) => {
                    if (response) {
                        resolve(response);
                    } else {
                        reject(new Error("No response received"));
                    }
                });
            });
            console.log(response);
        } catch (error) {
            console.error("Error in solveQCM:", error);
        }
    });
}
if (solveGenericElement) {
    solveGenericElement.addEventListener('click', async () => {
        let response;
        try {
            response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({type: "answer-generic"}, (response) => {
                    if (response) {
                        resolve(response);
                    } else {
                        reject(new Error("No response received"));
                    }
                });
            });
            console.log(response);
        } catch (error) {
            console.error("Error in solveGeneric:", error);
        }
    });
}
if (apiKeyInputElement && apiKeyStatusElement) {
    retrieveApiKeyFromStorage();
    apiKeyInputElement.addEventListener("input", async () => {
        const apiKey = apiKeyInputElement.value.trim();
        try {
            await saveApiKey(apiKey);
        } catch (error) {
            console.error('Error in saving API key:', error);
        }
    });
}
if (resetApiKeyElement && apiKeyInputElement && apiKeyStatusElement) {
    resetApiKeyElement.addEventListener("click", () => {
        chrome.storage.sync.remove("apiKey");
        apiKeyInputElement.value = "";
        apiKeyStatusElement.textContent = "Invalid or no API key";
        apiKeyStatusElement.style.color = "red";
    });
}
async function retrieveApiKeyFromStorage() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("apiKey", (result) => {
            if (result.apiKey) {
                if (apiKeyInputElement) {
                    apiKeyInputElement.value = result.apiKey;
                }
                if (apiKeyStatusElement) {
                    apiKeyStatusElement.textContent = "Valid API Key Retrieved";
                    apiKeyStatusElement.style.color = "green";
                }
                resolve(result.apiKey);
            } else {
                if (apiKeyStatusElement) {
                    apiKeyStatusElement.textContent = "No API key in storage";
                    apiKeyStatusElement.style.color = "red";
                }
                resolve(null);
            }
        });
    });
}


async function saveApiKey(apiKey) {
    // apiUrl should be a constant outside this method
    const apiUrl = "https://api.openai.com/v1/engines/davinci/completions";
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: "Test API key validity",
                max_tokens: 5,
            }),
        })
            .catch(error => {
                console.error("Network error:", error);
                throw new Error("Network error");
            });
        if (!response.ok) {
            throw new Error("Invalid API key");
        }
        if (apiKeyStatusElement) {
            apiKeyStatusElement.textContent = "Got valid API key";
            apiKeyStatusElement.style.color = "green";
        }
        chrome.storage.sync.set({apiKey});
    } catch (error) {
        if (apiKeyStatusElement) {
            apiKeyStatusElement.textContent = "Invalid or no API key";
            apiKeyStatusElement.style.color = "red";
        }
    }
}