const StatisticService = require("../services/statistic.service");

class StatisticController {
    async getStatistic(req, res) {
        try {
            if (req.params.role && req.body.filters) {
                const info = await StatisticService.getStatistic(req.params.role, req.body.filters);
                return res.status(200).send({ status: "success", message: "Success!", statistic: info });
            }
            return res.status(400).send({ status: "error", message: "Bad request!" });
        } catch (error) {
            res.status(500).send({ status: "error", message: "Server error!" });
            throw error;
        }
    }
}

module.exports = new StatisticController();