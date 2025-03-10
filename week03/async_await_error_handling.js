'use strict';

function resolveAfterMs(ms) {
    return new Promise((resolve, reject) => {
        if (ms < 0)
            reject('Negative delay requested')
        else
            setTimeout(() => {
                resolve('resolved');
            }, ms);
    });
}

async function asyncCall() {
    try {
        console.log('calling');
        // need to use try-catch or catch at a certain point in code, otherwise an error arises
        const result = await resolveAfterMs(-1);
        console.log(result);
        //return 'end';
    } catch (e) {
        console.log('Exception: ', e);
    }
}

asyncCall();
//asyncCall().then(console.log);
