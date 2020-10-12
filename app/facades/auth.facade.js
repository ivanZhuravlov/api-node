const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AgentService = require('../services/agent.service');

class AuthFacade {
    async login(email, password) {
        try {
            const user = await AgentService.find(email);
            if (user) {
                const user_banned = await AgentService.checkedBan(email);
                if (user_banned) return { code: 403, status: 'error', message: "Your account has been banned" };

                const password_mathes = await bcrypt.compare(password, user.password);
                if (password_mathes) {
                    const acces_token = jwt.sign({ data: email }, process.env.SECRET_KEY, { expiresIn: "24h" });

                    return {
                        code: 200,
                        status: "success",
                        message: "Login success",
                        user: {
                            id: user.id,
                            email: user.email,
                            fname: user.fname,
                            lname: user.lname,
                            states: JSON.parse(user.states),
                            role_id: user.role_id
                        },
                        token: acces_token
                    }
                }
            }

            return { code: 400, status: 'error', message: "Password or email incorrect" };
        } catch (error) {
            throw error;
        }
    }

    async verify(jwt_token) {
        try {
            const { err, data: email } = jwt.verify(jwt_token, process.env.SECRET_KEY);

            if (err) return { code: 403, status: 'error', message: 'Session end' }
            const account_banned = await AgentService.checkedBan(email);
            if (account_banned) return { code: 403, status: 'error', message: "Your account has been banned" };

            const candidate = await AgentService.find(email);
            if (candidate) {
                return {
                    code: 200,
                    status: "success",
                    message: "Verify success",
                    user: {
                        id: candidate.id,
                        email: candidate.email,
                        fname: candidate.fname,
                        lname: candidate.lname,
                        states: JSON.parse(candidate.states),
                        role_id: candidate.role_id
                    }
                };
            }

            return { code: 403, status: 'error', message: "Not authenticated" };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthFacade;