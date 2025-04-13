import React from 'react';

import Tables from '../Tables/tables';
import DownloadExcel from '../DownloadExcel/downloadExcel';


const UsersON = () => {
    return (
        <div>
            <Tables unidade="online"/>
            <DownloadExcel />
        </div>
    );
};

export default UsersON;