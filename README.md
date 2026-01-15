
# EisenFlow 🌊

**A dynamic, math-driven task manager based on the Eisenhower Matrix.**

EisenFlow isn't just a todo list; it's a prioritization engine. Unlike static lists, tasks in EisenFlow evolve. Their urgency scores increase dynamically as deadlines approach, ensuring that what you *need* to do bubbles to the top automatically.

With the addition of **Impact** and **Effort** metrics, you can now sort your life using advanced strategies like **ROI Analysis** and **Weighted Shortest Job First (WSJF)**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)

---

## 🚀 Key Features

### 🧠 The Smart Matrix
Tasks are automatically categorized into four quadrants based on Importance and calculated Urgency:
1.  **Do First:** High Urgency, High Importance.
2.  **Schedule:** Low Urgency, High Importance.
3.  **Delegate:** High Urgency, Low Importance.
4.  **Eliminate:** Low Urgency, Low Importance.

### 📈 Dynamic Urgency Curves
Deadlines aren't linear. EisenFlow lets you choose how urgency ramps up over time:
*   **Linear:** Urgency increases steadily as the deadline approaches.
*   **Fast (Front-Loaded):** Urgency spikes early and stays high (Good for anxiety-inducing tasks).
*   **Slow (Back-Loaded):** Urgency stays low until the last minute (Good for tasks you can cram).

### 🎯 Advanced Sorting Strategies
Switch between 5 mathematical models to sort your "All Tasks" view:
1.  **Default (Eisenhower):** `Urgency + Importance`. The classic approach.
2.  **Impact Density (ROI):** `Impact / (Effort + 10)`. Finds quick wins (High Impact, Low Effort).
3.  **Balanced Score (WSJF):** A complex formula weighing Importance, Impact, and Urgency against Effort.
4.  **Eat the Frog:** `(Effort * 0.6) + (Importance * 0.4)`. Tackles the hardest, most important tasks first.
5.  **Deadline Only:** Sorts strictly by time remaining.

### ☁️ Privacy-Focused Cloud Sync
Sync your tasks between devices without creating an account.
*   Generates a random **Sync Key**.
*   Uses a public JSON bin with your key as the identifier.
*   Perfect for moving between your phone and laptop instantly.

### 📊 Graph View
Visualize your tasks on a scatter plot (Importance vs. Urgency) to see exactly where your focus clusters.

---

## 🧮 The Math Behind the Magic

### The Balanced Score Formula
Derived from the Scaled Agile Framework's *Weighted Shortest Job First* (WSJF), this formula helps you decide what to do when everything feels important.

$$ Score = \frac{(0.55 \times Importance + 0.45 \times Impact) \times (1 + (\frac{Urgency}{100})^2)}{Effort + 10} $$

*   **Numerator:** Represents the "Cost of Delay". We weigh Importance and Impact, then apply a non-linear multiplier based on Urgency (urgency creates exponential pressure).
*   **Denominator:** Represents the "Job Size". We penalize high-effort tasks to prioritize efficiency.

---

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Dark Mode enabled)
*   **Icons:** Lucide React
*   **Build Tool:** Vite (implied)
*   **Persistence:** LocalStorage + JSONBin.io (for sync)

---

## 💻 Getting Started

### Prerequisites
*   Node.js installed.
*   A package manager (npm, yarn, pnpm).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/eisenflow.git
    cd eisenflow
    ```

2.  **Install dependencies**
    *Note: This project uses direct ESM imports in `index.html` for a no-build setup demonstration, but standard development requires installation.*
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 📱 User Guide

1.  **Adding a Task:** Click the `+` button. You can set the title, description, and four sliders:
    *   **Importance:** Does this matter for long-term goals?
    *   **Urgency:** How soon does it need attention?
    *   **Impact:** What is the payoff?
    *   **Effort:** How hard is it?
2.  **Setting Deadlines:** Toggle the due date. Select a "Curve" to define how urgency accumulates.
3.  **Views:**
    *   **Matrix:** The classic quadrant view.
    *   **All Tasks:** A master list where you can apply sorting strategies.
    *   **Graph:** A visual scatter plot.
4.  **Syncing:** Click the Sync icon (circular arrows). Generate a key on one device, then enter that key on another device to link them.

---

## 🎨 Customization

The app supports system-preference dark mode automatically, but can be toggled manually via the Sun/Moon icon in the header.

---

*Built with ❤️ for productivity nerds.*
