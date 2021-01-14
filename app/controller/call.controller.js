const twilio = require('twilio');
const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;
const client = require('socket.io-client')(process.env.WEBSOCKET_URL);
const axios = require('axios');
const RecordService = require('../services/records.service');
const models = require('../../database/models');
const TransformationHelper = require('../helpers/transformation.helper');
const StateService = require('../services/state.service');
const UserRepository = require('../repository/user.repository');
const MessageService = require('../twilio/message/message.service');

function token(req, res) {
    const capability = new ClientCapability({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN
    });

    capability.addScope(
        new ClientCapability.OutgoingClientScope({
            applicationSid: process.env.TWILIO_TWIML_APP_SID
        })
    );

    const token = capability.toJwt();

    return res.status(200).json({ token });
}

function voice(req, res) {
    const voiceResponse = new VoiceResponse();

    voiceResponse.dial({
        record: 'record-from-answer-dual',
        recordingStatusCallbackEvent: "completed",
        recordingStatusCallback: `${process.env.CALLBACK_TWILIO}/api/call/record-callback/${req.body.lead_id}/${req.body.user_id}`,
        callerId: process.env.TWILIO_NUMBER,
    }, req.body.number);

    return res.type('text/xml').send(voiceResponse.toString());
}

async function recordCallback(req, res) {
    try {
        const record = {
            user_id: req.params.user_id,
            lead_id: req.params.lead_id,
            url: req.body.RecordingUrl,
        };

        client.emit('record-create', record);

        return res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error!" });
    }
}

async function transcriptionCallback(req, res) {
    try {
        let transcriptionRequestBody = JSON.parse(req.body.AddOns);
        const transcriptionUrl = transcriptionRequestBody.results[process.env.TWILIO_ADDONS_VOICEBASE_NAME].payload[0].url;
        const recordingUrl = transcriptionRequestBody.results[process.env.TWILIO_ADDONS_VOICEBASE_NAME].links.recording;
        const result = await axios.get(transcriptionUrl, {
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN
            }
        });
        const transcriptionText = result.data.media.transcripts.text;

        await RecordService.saveTranscriptionText(recordingUrl, transcriptionText);

        return res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ status: 'error', message: "Server Error!" });
        throw err;
    }
}

async function inboundCall(req, res) {
    try {
        const data = req.body;

        if ("CallSid" in dat & a & "From" in data) {
            let agent;

            let callbackVoiseMailUrl = "";
            let callbackTextMessage = "";

            const formatedPhone = TransformationHelper.phoneNumberForSearch(data.From);

            let lead = await models.Leads.findOne({
                where: {
                    phone: formatedPhone
                }
            });

            const twiml = new VoiceResponse();

            twiml.say({
                voice: 'alice'
            }, 'Please wait connection with agent!');

            if (lead) {
                if (lead.user_id) {
                    agent = await UserRepository.findSuitableAgent(lead.user_id);
                    if (!agent) {
                        callbackVoiseMailUrl = "";
                        callbackTextMessage = "";
                    }
                } else {
                    if (lead.state_id) {
                        agent = await UserRepository.findSuitableAgent(null, lead.state_id);
                    } else {
                        let state_id = await StateService.getStateIdFromPhone(formatedPhone);

                        if (state_id) {
                            agent = await UserRepository.findSuitableAgent(null, state_id);
                        }
                    }
                }
            } else {
                let state_id = await StateService.getStateIdFromPhone(formatedPhone);

                if (state_id) {
                    agent = await UserRepository.findSuitableAgent(null, state_id);
                }
            }

            if (agent) {
                if (lead) {
                    if (lead.user_id != agent.id) {
                        client.emit("assign-agent", lead.id, agent.id);
                    }

                    if (lead.id) {
                        client.emit("send-lead-id", lead.id, agent.id);
                    }
                }

                const dial = twiml.dial();

                dial.client(agent.id);
            } else {
                twiml.play(callbackVoiseMailUrl);
                MessageService.sendMessage("", data.From, callbackTextMessage);
            }

            res.type('text/xml');
            return res.status(200).send(twiml.toString());
        }

        return res.status(400).json({ status: 'error', message: "Bad request!" });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "Server Error!" });
        throw error;
    }
}


module.exports = {
    token,
    voice,
    recordCallback,
    transcriptionCallback,
    inboundCall
}