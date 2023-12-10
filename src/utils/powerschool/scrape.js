let {PythonShell} = require("python-shell");
const {AutoQueue} = require("./data_structures/queue/auto_queue");

module.exports = {
    loginAndScrapeGrades: function (processor, school, email, password, data_if_locked = {}, term_data_if_locked = {}, get_history = 'false') {
        let pythonPath = process.platform === "win32" ? "py" : "python3";

        let options = {
            mode: "json", 
            pythonOptions: ['-u'], 
            scriptPath: './src/utils/powerschool',
            pythonPath: pythonPath,
            args: [school, email, password, JSON.stringify(data_if_locked), JSON.stringify(term_data_if_locked), get_history]
        };

        try {
            const pyshell = new PythonShell("./scrape.py", options);
            let queue = new AutoQueue();

            pyshell.on("message", (data) => {
                queue.enqueue(async () => await processor(data), data.message);
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
