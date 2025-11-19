const aiService = {
    intents: {
        order_issue: {
            patterns: ['wrong item', 'missing item', 'incorrect order', 'wrong order', 'not what i ordered'],
            responses: [
                "I'm sorry to hear about the issue with your order. Let me connect you with a support agent who can help resolve this right away.",
                "I understand there's a problem with your order. Our support team will assist you immediately."
            ]
        },
        delivery_delay: {
            patterns: ['taking too long', 'not delivered', 'where is my order', 'delay', 'late', 'slow'],
            responses: [
                "I understand you're concerned about your order timing. Let me check this with our support team.",
                "Delivery delays can be frustrating. I'm escalating this to our support team for immediate attention."
            ]
        },
        quality_complaint: {
            patterns: ['cold food', 'bad quality', 'not fresh', 'taste bad', 'poor quality', 'spoiled', 'stale'],
            responses: [
                "I'm sorry the food quality wasn't up to standard. This needs immediate attention from our support team.",
                "Quality issues are important to us. Let me connect you with a support agent right away."
            ]
        },
        refund_request: {
            patterns: ['refund', 'money back', 'cancel order', 'return', 'reimburse'],
            responses: [
                "I'll help you with the refund process. Let me connect you with a support agent who can process this.",
                "Refund requests require verification. A support agent will assist you shortly."
            ]
        },
        payment_issue: {
            patterns: ['payment failed', 'charged twice', 'payment problem', 'billing issue', 'double charge'],
            responses: [
                "Payment issues need immediate attention. I'm connecting you with our support team.",
                "I understand there's a payment concern. Our support team will help resolve this right away."
            ]
        }
    },

    detectIntent: function(message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [intent, data] of Object.entries(this.intents)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern)) {
                    return intent;
                }
            }
        }
        
        return 'other';
    },

    generateResponse: async function(message, ticketType) {
        const intent = this.detectIntent(message);
        const lowerMessage = message.toLowerCase();
        
        let matchCount = 0;
        let totalPatterns = 0;

        if (this.intents[intent]) {
            totalPatterns = this.intents[intent].patterns.length;
            for (const pattern of this.intents[intent].patterns) {
                if (lowerMessage.includes(pattern)) {
                    matchCount++;
                }
            }
        }

        const confidence = totalPatterns > 0 ? matchCount / totalPatterns : 0.5;

        const needsHuman = 
            confidence < 0.7 || 
            intent === 'refund_request' || 
            intent === 'payment_issue' ||
            lowerMessage.includes('speak to human') ||
            lowerMessage.includes('agent') ||
            lowerMessage.includes('manager');

        let responseMessage = "I understand your concern. Let me assist you with that.";
        
        if (this.intents[intent] && this.intents[intent].responses) {
            const responses = this.intents[intent].responses;
            responseMessage = responses[Math.floor(Math.random() * responses.length)];
        }

        if (needsHuman) {
            responseMessage += " I'm connecting you with a human support agent who can better assist you.";
        } else {
            responseMessage += " Can you please provide more details so I can help you better?";
        }

        return {
            message: responseMessage,
            intent: intent,
            confidence: parseFloat(confidence.toFixed(2)),
            needsHuman: needsHuman
        };
    }
};

module.exports = aiService;