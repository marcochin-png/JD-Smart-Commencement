/**
 * Universal Chat UI/UX Helper Functions
 * Generic UI interactions for chat interfaces
 * Does not contain specific scenario content
 */

/**
 * Append a user message bubble to the chat
 * @param {string} text - The message text
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 */
function appendUserMessage(text, containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return;
  }

  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'chat-message message-user';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  messageWrapper.appendChild(bubble);
  container.appendChild(messageWrapper);

  scrollToBottom(container);
}

/**
 * Append a bot message bubble to the chat
 * @param {string} text - The message text
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 * @param {boolean} showAvatar - Whether to show the bot avatar (default: true)
 */
function appendBotMessage(text, containerSelector = '.chat-messages-area', showAvatar = true) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return;
  }

  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'chat-message message-bot';

  if (showAvatar) {
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
        <rect x="5" y="8" width="14" height="12" rx="2"/>
      </svg>
    `;
    messageWrapper.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  messageWrapper.appendChild(bubble);
  container.appendChild(messageWrapper);

  scrollToBottom(container);
}

/**
 * Show the typing indicator
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 * @returns {HTMLElement} The typing indicator element
 */
function showTypingIndicator(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return null;
  }

  // Remove existing typing indicator if present
  hideTypingIndicator(containerSelector);

  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  `;

  container.appendChild(typingIndicator);
  scrollToBottom(container);

  return typingIndicator;
}

/**
 * Hide the typing indicator
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 */
function hideTypingIndicator(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return;
  }

  const existingIndicator = container.querySelector('.typing-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }
}

/**
 * Render quick reply options/chips
 * @param {Array<{label: string, value: string}>} optionsArray - Array of option objects
 * @param {Function} callback - Function to call when a chip is clicked: callback(value)
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 * @returns {HTMLElement} The options container element
 */
function renderQuickOptions(optionsArray, callback, containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return null;
  }

  // Remove existing options container if present
  removeQuickOptions(containerSelector);

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'chat-options-container';

  optionsArray.forEach(option => {
    const chip = document.createElement('button');
    chip.className = 'chat-chip';
    chip.textContent = option.label;
    chip.setAttribute('data-value', option.value);

    chip.addEventListener('click', () => {
      // Fade out the options container
      optionsContainer.classList.add('fade-out');

      // Append user message with the clicked label
      appendUserMessage(option.label, containerSelector);

      // Remove the options container after animation
      setTimeout(() => {
        optionsContainer.classList.add('hidden');
        optionsContainer.remove();
      }, 300);

      // Execute the callback with the value
      if (typeof callback === 'function') {
        callback(option.value);
      }
    });

    optionsContainer.appendChild(chip);
  });

  container.appendChild(optionsContainer);
  scrollToBottom(container);

  return optionsContainer;
}

/**
 * Remove quick reply options container
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 */
function removeQuickOptions(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return;
  }

  const existingOptions = container.querySelector('.chat-options-container');
  if (existingOptions) {
    existingOptions.remove();
  }
}

/**
 * Scroll the chat container to the bottom
 * @param {HTMLElement} container - The chat container element
 */
function scrollToBottom(container) {
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

/**
 * Clear all messages from the chat
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 */
function clearChat(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return;
  }

  // Keep the typing indicator if present, remove everything else
  const typingIndicator = container.querySelector('.typing-indicator');
  const optionsContainer = container.querySelector('.chat-options-container');

  container.innerHTML = '';

  if (typingIndicator) {
    container.appendChild(typingIndicator);
  }

  if (optionsContainer) {
    container.appendChild(optionsContainer);
  }
}

/**
 * Get the last message in the chat
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 * @returns {HTMLElement|null} The last message element or null
 */
function getLastMessage(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return null;
  }

  const messages = container.querySelectorAll('.chat-message');
  return messages.length > 0 ? messages[messages.length - 1] : null;
}

/**
 * Check if there are any pending quick options
 * @param {string} containerSelector - Selector for the chat messages container (default: '.chat-messages-area')
 * @returns {boolean} True if quick options are present
 */
function hasQuickOptions(containerSelector = '.chat-messages-area') {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Chat container not found:', containerSelector);
    return false;
  }

  return container.querySelector('.chat-options-container') !== null;
}

// Export functions for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    appendUserMessage,
    appendBotMessage,
    showTypingIndicator,
    hideTypingIndicator,
    renderQuickOptions,
    removeQuickOptions,
    scrollToBottom,
    clearChat,
    getLastMessage,
    hasQuickOptions
  };
}
