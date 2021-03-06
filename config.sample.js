'use strict';

var config = {

    domain : '127.0.0.1',

    port : 8069,

    build_script : {
        'default'   : '*******.sh',
        'project_a' : '*******_a.sh',
        'project_b' : '*******_b.sh',
        'project_c' : '*******_b.sh',
    },

    notification : 'error', // all

    token : '****************************************************************',

    mailgun : {
        api_key    : '*******',
        sender     : '*******@*******.com',
        recipients : ['******@******.com']
    }

};

module.exports = config;
