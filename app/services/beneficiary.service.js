const models = require('../../database/models');
const BeneficiaryRepository = require('../repository/BeneficiaryRepository');

class BeneficiaryService {

    async save(beneficiary_options) {
        try {
            const beneficiary = await models.Beneficiaries.findOne({
                where: { lead_id: beneficiary_options.lead_id }
            });

            const { dataValues: state } = await models.States.findOne({
                attributes: ["id"],
                where: { name: beneficiary_options.location }
            });

            if (beneficiary) {
                await beneficiary.update({
                    name: beneficiary_options.name,
                    dob: beneficiary_options.dob,
                    relative_id: beneficiary_options.relative_id,
                    location_id: state.id,
                    grand_kids: beneficiary_options.grand_kids,
                    work_status: beneficiary_options.work_status
                });

                return { code: 200, status: "success", message: "Beneficiary updated!" };
            } else {
                await models.Beneficiaries.create({
                    lead_id: beneficiary_options.lead_id,
                    name: beneficiary_options.name,
                    dob: beneficiary_options.dob,
                    relative_id: beneficiary_options.relative_id,
                    location_id: state.id,
                    grand_kids: beneficiary_options.grand_kids,
                    work_status: beneficiary_options.work_status
                });

                return { code: 201, status: "success", message: "Beneficiary created!" };
            }

        } catch (error) {
            throw error;
        }
    }

    async getOne(lead_id) {
        try {
            const beneficiary = await BeneficiaryRepository.getOne(lead_id);

            return { code: 200, status: "success", message: "Success", beneficiary: beneficiary || {} };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BeneficiaryService;