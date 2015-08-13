'use strict';

var config = {

    port : 8069,

    build_script : {
        'default'   : '*******.sh',
        'project_a' : '*******_a.sh',
        'project_b' : '*******_b.sh',
        'project_c' : '*******_b.sh'
    }

    token : '****************************************************************',

    mailgun : {
        api_key    : '*******',
        sender     : '*******@*******.com',
        recipients : ['******@******.com']
    }

};

module.exports = config;
