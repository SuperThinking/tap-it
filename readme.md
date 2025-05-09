# Tap-It Chrome Extension

**Tap-It** is a simple Chrome extension that lets you map keyboard keys to click specific elements on websites. Create custom shortcuts for your favorite sites!

# Installation
The extension is available for [Google Chrome](https://chromewebstore.google.com/detail/tap-it/nofolooakncdaeapllonekcemhgcnobe)

[![](https://img.shields.io/chrome-web-store/v/pcmpcfapbekmbjjkdalcgopdkipoggdi.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/tap-it/nofolooakncdaeapllonekcemhgcnobe) [![](https://img.shields.io/chrome-web-store/rating/nofolooakncdaeapllonekcemhgcnobe.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/tap-it/nofolooakncdaeapllonekcemhgcnobe) [![](https://img.shields.io/chrome-web-store/users/nofolooakncdaeapllonekcemhgcnobe.svg?logo=google-chrome&style=flat)](https://chrome.google.com/webstore/detail/tap-it/nofolooakncdaeapllonekcemhgcnobe)

## Motivation

Have you ever wished you could trigger an action on a website with a single key press, but there was no built-in shortcut?

That's exactly what happened while playing chess on chess.com. I wanted to quickly enter focus mode, often mapped to the `F` key in other applications, but couldn't. Tap-It was created to solve this – allowing you to map *any* key to *any* clickable element on *any* website.

## Features

* **Custom Key Bindings:** Map specific keyboard keys (e.g., `f`, `space`, `1`) to click elements on web pages.
* **Site-Specific Mappings:** Create different key mappings for different websites (e.g., `r` might do one thing on GitHub and another on YouTube).
* **Simple Mapping Process:** Right-click the element you want to control, select "Tap-It: Map Element" from the context menu, and press the desired key.
* **Popup Management UI:**
    * View all your saved mappings grouped by website.
    * Add descriptive labels to your mappings (e.g., "Focus Mode", "Next Video").
    * Delete individual mappings or all mappings for a specific site.
    * **Import/Export:** Export your mappings for selected websites to a JSON file to back them up or share them with others. Import mappings from a JSON file.
 
![final-image (4)](https://github.com/user-attachments/assets/e0f95e4d-c664-4e74-88ec-86317d466641)
![final-image (3)](https://github.com/user-attachments/assets/d9bc0c5b-7fb8-409f-a9d6-92c24a6317c9)
![final-image (5)](https://github.com/user-attachments/assets/3ba6450f-a7ff-4fa7-8e98-30d4a4fe95ab)

   ### Demo
   [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/rvvmgo9y9kQ/0.jpg)](https://www.youtube.com/watch?v=rvvmgo9y9kQ)



## How to Use

1.  **Install the extension** (See Installation below).
2.  **Navigate** to the website where you want to create a shortcut.
3.  **Right-click** on the button or element you want to control with a key.
4.  Select **"Tap-It: Map Element"** from the context menu.
5.  An overlay will appear prompting you to **press the key** you want to use. Press the desired key (e.g., `f`). Avoid using modifier keys (Shift, Ctrl, Alt) alone.
6.  The mapping is saved! Now, whenever you're on that specific website (and not typing in an input field), pressing that key will simulate a click on the element you selected.
7.  **Click the Tap-It extension icon** in your toolbar to open the popup and manage your mappings (view, label, delete, import/export).

## Installation (From Source)

1.  **Download** or clone this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** using the toggle switch in the top-right corner.
4.  Click the **"Load unpacked"** button.
5.  Select the directory where you downloaded/cloned the repository files.
6.  The Tap-It extension should now be installed and visible in your toolbar!

---

Feel free to suggest improvements or report issues!
