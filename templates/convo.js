const sampleConvo = (convo) => {
    const question = (convo) => {
        const user = convo.get('user');
        // return Message.
    };

    const handleAnswer = (payload, convo) => {

    };

    const callbacks = [
        {
            event: '',
            callback: (payload, convo) => {

            }
        }
    ];

    const options = {};

    return convo.ask(question, handleAnswer, callbacks, options);
};