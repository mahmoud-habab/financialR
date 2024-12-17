document.addEventListener("DOMContentLoaded", () => {
    // Create Modal Structure
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close">&times;</button>
            <div id="modalBody"></div>
        </div>`;
    document.body.appendChild(modal);

    const modalBody = modal.querySelector("#modalBody");
    const closeModalButton = modal.querySelector(".close");
    let chartInstance; // For handling dynamic chart updates

    // Show Modal with Title, Message, and Optional Chart
    const showModal = (title, message, chartData) => {
        modalBody.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <canvas id="resultChart"></canvas>`;
        modal.style.display = "flex";

        // Modal Animation
        anime({
            targets: '.modal-content',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBack',
        });

        // Destroy previous chart instance
        if (chartInstance) chartInstance.destroy();

        // Render new chart if data is provided
        if (chartData) {
            const ctx = document.getElementById("resultChart").getContext("2d");
            chartInstance = new Chart(ctx, chartData);
        }
    };

    // Close Modal
    const closeModal = () => {
        anime({
            targets: '.modal-content',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInBack',
            complete: () => {
                modal.style.display = "none";
            },
        });
    };

    closeModalButton.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeIcon = document.getElementById("darkModeIcon");

    const toggleDarkMode = () => {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        darkModeIcon.src = isDarkMode ? "moon-icon.svg" : "sun-icon.svg";
        localStorage.setItem("darkMode", isDarkMode);
    };

    // Load Dark Mode Preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    if (savedDarkMode) {
        document.body.classList.add("dark-mode");
        darkModeIcon.src = "moon-icon.svg";
    }

    darkModeToggle.addEventListener("click", toggleDarkMode);

    // Wrap every letter in a span
    var textWrapper = document.querySelector('.ml11 .letters');
    textWrapper.innerHTML = textWrapper.textContent.replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>");

    anime.timeline({ loop: true })
        .add({
            targets: '.ml11 .line',
            scaleY: [0, 1],
            opacity: [0.5, 1],
            easing: "easeOutExpo",
            duration: 700
        })
        .add({
            targets: '.ml11 .line',
            translateX: [0, document.querySelector('.ml11 .letters').getBoundingClientRect().width + 10],
            easing: "easeOutExpo",
            duration: 700,
            delay: 100
        }).add({
            targets: '.ml11 .letter',
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 600,
            offset: '-=775',
            delay: (el, i) => 34 * (i + 1)
        }).add({
            targets: '.ml11',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000
        });

    // Retirement Savings Calculator
    document.getElementById("calculateRetirement").addEventListener("click", () => {
        const currentAge = parseFloat(document.getElementById("currentAge").value);
        const retirementAge = parseFloat(document.getElementById("retirementAge").value);
        const currentSavings = parseFloat(document.getElementById("currentSavings").value);
        const monthlyContribution = parseFloat(document.getElementById("monthlyContribution").value);
        const annualReturn = parseFloat(document.getElementById("annualReturn").value) / 100;

        if ([currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn].some(isNaN)) {
            alert("Please fill in all fields with valid numbers.");
            return;
        }

        const years = retirementAge - currentAge;
        if (years <= 0) {
            alert("Retirement age must be greater than current age.");
            return;
        }

        let totalSavings = currentSavings;
        const savingsGrowth = Array.from({ length: years }, (_, i) => {
            totalSavings = totalSavings * (1 + annualReturn) + monthlyContribution * 12;
            return totalSavings;
        });

        const chartData = {
            type: "line",
            data: {
                labels: Array.from({ length: years }, (_, i) => `Year ${i + 1}`),
                datasets: [
                    {
                        label: "Savings Growth ($)",
                        data: savingsGrowth,
                        borderColor: "#007bff",
                        fill: false,
                        tension: 0.1,
                    },
                ],
            },
        };

        showModal(
            "Retirement Savings",
            `Your total savings at retirement will be $${totalSavings.toFixed(2)}.`,
            chartData
        );
    });

    // Budget Planner
    document.getElementById("calculateBudget").addEventListener("click", () => {
        const income = parseFloat(document.getElementById("income").value);
        const expenses = parseFloat(document.getElementById("expenses").value);

        if (isNaN(income) || isNaN(expenses)) {
            alert("Please enter valid numbers for income and expenses.");
            return;
        }

        const balance = income - expenses;
        const chartData = {
            type: "doughnut",
            data: {
                labels: ["Income", "Expenses"],
                datasets: [
                    {
                        data: [income, expenses],
                        backgroundColor: ["#4caf50", "#f44336"],
                    },
                ],
            },
        };

        const message =
            balance >= 0
                ? `You have a surplus of $${balance.toFixed(2)}.`
                : `You have a deficit of $${Math.abs(balance).toFixed(2)}.`;

        showModal("Budget Planner", message, chartData);
    });

    // Expense Tracker
    const expenseCategories = {};

    document.getElementById("addExpense").addEventListener("click", () => {
        const description = document.getElementById("expenseDescription").value;
        const amount = parseFloat(document.getElementById("expenseAmount").value);
        const category = document.getElementById("expenseCategory").value;

        if (!description || isNaN(amount) || amount <= 0) {
            alert("Please enter valid expense details.");
            return;
        }

        expenseCategories[category] = (expenseCategories[category] || 0) + amount;

        const chartData = {
            type: "pie",
            data: {
                labels: Object.keys(expenseCategories),
                datasets: [
                    {
                        data: Object.values(expenseCategories),
                        backgroundColor: ["#4caf50", "#2196f3", "#f44336", "#ff9800", "#9c27b0"],
                    },
                ],
            },
        };

        showModal(
            "Expense Tracker",
            `Expense "${description}" added for $${amount.toFixed(2)} under "${category}".`,
            chartData
        );
    });

    // Button Animation
    anime({
        targets: '.btn',
        scale: [1, 1.05],
        duration: 300,
        easing: 'easeInOutQuad',
        loop: true,
        direction: 'alternate',
    });

    /* ========================
        New Added Features
    ======================== */

    // Add Scroll-to-Top Button
    const scrollToTopButton = document.createElement("button");
    scrollToTopButton.classList.add("scroll-to-top");
    scrollToTopButton.innerHTML = "↑";
    document.body.appendChild(scrollToTopButton);

    scrollToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            scrollToTopButton.style.display = "block";
        } else {
            scrollToTopButton.style.display = "none";
        }
    });
});
