const csvToJson = require('convert-csv-to-json');
const formidable = require('formidable');
const FormatService = require('../services/format.service');

async function uploadCSV(req, res) {
    const form = new formidable.IncomingForm();

    try {
        const rawLeads = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                const delimiter = fields.delimiter;

                const result = csvToJson.fieldDelimiter(delimiter).formatValueByType().getJsonFromCsv(files["file"].path);

                resolve(result);
            });
        });

        if (rawLeads) {
            const formatedLead = await FormatService.formatRawLeads(rawLeads);
            console.log("uploadCSV -> formatedLead", formatedLead)
        }
        // if (rawLeadsJSON) {
        //     const idArray = await UploadService.parseCSVfileToDB(rawLeadsJSON);

        //     if (idArray)
        //         client.emit('raw-leads', idArray);
        // }

        res.status(200).json({
            status: "success",
            message: "Success parsed CSV file into system"
        });
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: "Server error!"
        });

        throw new Error(err);
    }
}

module.exports = {
    uploadCSV
};