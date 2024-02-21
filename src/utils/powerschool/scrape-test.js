let { PythonShell } = require("python-shell");
let readlineSync = require("readline-sync");

function loginAndScrapeGrades(processor, school, get_history = 'false') {
    let email = "abhijay.rana25@bcp.org"
    let password = readlineSync.question("Please enter your password: ", {
        hideEchoBack: true
    });

    let data_if_locked = {}; // Assuming these are default empty objects
    let term_data_if_locked = {};

    let pythonPath = process.platform === "win32" ? "py" : "python3";

    let options = {
        mode: "json",
        pythonOptions: ['-u'],
        scriptPath: './',
        pythonPath: pythonPath,
        args: [school, email, password, JSON.stringify(data_if_locked), JSON.stringify(term_data_if_locked), get_history]
    };

    try {
        let pyshell = new PythonShell("./scrape.py", options);

        pyshell.on("message", (data) => {
            processor(data);
        });

        pyshell.end(function (err) {
            if (err) {
                processor({success: false, message: 'Error in Python script execution: ' + err.message});
            }
        });
    } catch (e) {
        processor({success: false, message: 'Error setting up Python Shell: ' + e.message});
    }
}

// Example usage
console.log("Example usage:");
function processor (data) {
    console.log("data:")
    console.log(data.new_grades['23-24']["S1"]);
}
loginAndScrapeGrades(processor, 'bellarmine', 'false');
