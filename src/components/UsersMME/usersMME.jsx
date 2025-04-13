import React from 'react';

import Tables from '../Tables/tables';
import DownloadExcel from '../DownloadExcel/downloadExcel';


const UsersMME = () => {
    return (
        <div>
            <Tables unidade="Mamanguape"/>
            <DownloadExcel />

        </div>
    );
};

export default UsersMME;