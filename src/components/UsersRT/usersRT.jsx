import React from 'react';

import Tables from '../Tables/tables';
import DownloadExcel from '../DownloadExcel/downloadExcel';


const UsersRT = () => {
    return (
        <div>
            <Tables unidade="RioTinto"/>
            <DownloadExcel />

        </div>
    );
};

export default UsersRT;