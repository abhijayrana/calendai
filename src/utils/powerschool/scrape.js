let {PythonShell} = require("python-shell");
const {AutoQueue} = require("./data_structures/queue/auto_queue");

module.exports = {
    loginAndScrapeGrades(processor, school, username, password, get_history = 'false') {
        // If the password is not provided, ask for it
        if (!password) {
            password = readlineSync.question("Please enter your password: ", {
                hideEchoBack: true
            });
        }
    
        let data_if_locked = {}; // Assuming these are default empty objects
        let term_data_if_locked = {};
    
        let pythonPath = process.platform === "win32" ? "py" : "python3";
    
        let options = {
            mode: "json",
            pythonOptions: ['-u'],
            scriptPath: './src/utils/powerschool/',
            pythonPath: pythonPath,
            args: [school, username, password, JSON.stringify(data_if_locked), JSON.stringify(term_data_if_locked), get_history]
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
};

