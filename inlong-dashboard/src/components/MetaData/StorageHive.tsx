/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { Button, message } from 'antd';
import {
  getColsFromFields,
  GetStorageColumnsType,
  GetStorageFormFieldsType,
} from '@/utils/metaData';
import EditableTable, { ColumnsItemProps } from '@/components/EditableTable';
import request from '@/utils/request';
import i18n from '@/i18n';
import { excludeObject } from '@/utils';
import { sourceDataFields } from './SourceDataFields';

// hiveFieldTypes
const hiveFieldTypes = [
  'tinyint',
  'smallint',
  'int',
  'bigint',
  'float',
  'double',
  // 'decimal',
  // 'numeric',
  // 'timestamp',
  // 'date',
  'string',
  // 'varchar',
  // 'char',
  'boolean',
  'binary',
].map(item => ({
  label: item,
  value: item,
}));

export const hiveTableColumns = [
  {
    title: i18n.t('components.AccessHelper.StorageMetaData.Hive.TargetDb'),
    dataIndex: 'dbName',
  },
  {
    title: i18n.t('components.AccessHelper.StorageMetaData.Hive.TargetTable'),
    dataIndex: 'tableName',
  },
  {
    title: i18n.t('components.AccessHelper.StorageMetaData.Hive.Username'),
    dataIndex: 'username',
  },
  {
    title: 'JDBC URL',
    dataIndex: 'jdbcUrl',
  },
  {
    title: 'HDFS DefaultFS',
    dataIndex: 'hdfsDefaultFs',
  },
];

export const getHiveColumns: GetStorageColumnsType = (dataType, currentValues) => [
  ...([
    ...sourceDataFields,
    {
      title: `HIVE${i18n.t('components.AccessHelper.StorageMetaData.Hive.FieldName')}`,
      dataIndex: 'fieldName',
      initialValue: '',
      rules: [
        { required: true },
        {
          pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
          message: i18n.t('components.AccessHelper.StorageMetaData.Hive.FieldNameRule'),
        },
      ],
      props: (text, record, idx, isNew) => ({
        // disabled: text && !isNew,
        // disabled: [110, 130].includes(currentValues?.status as number) && !isNew,
      }),
    },
    {
      title: `HIVE${i18n.t('components.AccessHelper.StorageMetaData.Hive.FieldType')}`,
      dataIndex: 'fieldType',
      initialValue: hiveFieldTypes[0].value,
      type: 'select',
      props: (text, record, idx, isNew) => ({
        options: hiveFieldTypes,
        // disabled: text && !isNew,
      }),
      rules: [{ required: true }],
    },
    {
      title: i18n.t('components.AccessHelper.StorageMetaData.Hive.FieldDescription'),
      dataIndex: 'fieldComment',
      initialValue: '',
    },
  ] as ColumnsItemProps[]),
];

export const getHiveForm: GetStorageFormFieldsType = (
  type,
  { currentValues, inlongGroupId, isEdit, dataType, form } = {} as any,
) => {
  const fileds = [
    {
      type: 'input',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.TargetDb'),
      name: 'dbName',
      rules: [{ required: true }],
      props: {
        disabled: isEdit,
      },
    },
    {
      type: 'input',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.TargetTable'),
      name: 'tableName',
      rules: [{ required: true }],
      props: {
        disabled: isEdit,
      },
    },
    {
      type: 'input',
      name: 'primaryPartition',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.First-levelPartition'),
      initialValue: 'dt',
      rules: [{ required: true }],
      props: {
        disabled: isEdit,
      },
    },
    {
      type: 'input',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.Username'),
      name: 'username',
      rules: [{ required: true }],
      props: {
        disabled: isEdit,
      },
    },
    {
      type: 'password',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.Password'),
      name: 'password',
      rules: [{ required: true }],
      props: {
        disabled: isEdit,
        style: {
          maxWidth: 500,
        },
      },
    },
    {
      type: 'input',
      label: 'JDBC URL',
      name: 'jdbcUrl',
      rules: [{ required: true }],
      props: {
        placeholder: 'jdbc:hive2://127.0.0.1:10000',
        disabled: isEdit,
        style: { width: 500 },
      },
      suffix: (
        <Button
          onClick={async () => {
            const values = await form.validateFields(['username', 'password', 'jdbcUrl']);
            const res = await request({
              url: '/storage/query/testConnection',
              method: 'POST',
              data: values,
            });
            res
              ? message.success(
                  i18n.t('components.AccessHelper.StorageMetaData.Hive.ConnectionSucceeded'),
                )
              : message.error(
                  i18n.t('components.AccessHelper.StorageMetaData.Hive.ConnectionFailed'),
                );
          }}
        >
          {i18n.t('components.AccessHelper.StorageMetaData.Hive.ConnectionTest')}
        </Button>
      ),
    },
    {
      type: 'input',
      label: 'HDFS DefaultFS',
      name: 'hdfsDefaultFs',
      rules: [{ required: true }],
      props: {
        placeholder: 'hdfs://127.0.0.1:9000',
        disabled: isEdit,
      },
    },
    {
      type: 'input',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.WarehousePath'),
      name: 'warehouseDir',
      initialValue: '/user/hive/warehouse',
      props: {
        disabled: isEdit,
      },
    },
    {
      name: 'fileFormat',
      type: 'radio',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.FileFormat'),
      initialValue: 'TextFile',
      rules: [{ required: true }],
      props: {
        options: [
          {
            label: 'TextFile',
            value: 'TextFile',
          },
          {
            label: 'SequenceFile',
            value: 'SequenceFile',
          },
          // {
          //   label: 'RcFile',
          //   value: 'RcFile',
          // },
          {
            label: 'OrcFile',
            value: 'OrcFile',
          },
          {
            label: 'Parquet',
            value: 'Parquet',
          },
          {
            label: 'Avro',
            value: 'Avro',
          },
        ],
        disabled: isEdit && [110, 130].includes(currentValues?.status),
      },
    },
    {
      name: 'storagePeriod',
      type: 'inputnumber',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.StoragePeriod'),
      tooltip: 'Optional range: -1 ~ 3600, -1 means permanent storage',
      rules: [{ required: true }],
      suffix: i18n.t('components.AccessHelper.StorageMetaData.Hive.Day'),
      props: {
        min: -1,
        max: 3600,
        disabled: isEdit && [110, 130].includes(currentValues?.status),
      },
    },
    {
      name: 'dataEncoding',
      type: 'radio',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.DataEncoding'),
      initialValue: 'UTF-8',
      props: {
        disabled: isEdit && [110, 130].includes(currentValues?.status),
        options: [
          {
            label: 'UTF-8',
            value: 'UTF-8',
          },
          {
            label: 'GBK',
            value: 'GBK',
          },
        ],
      },
      rules: [{ required: true }],
    },
    {
      name: 'dataSeparator',
      type: 'select',
      label: i18n.t('components.AccessHelper.StorageMetaData.Hive.DataSeparator'),
      initialValue: '124',
      props: {
        disabled: isEdit && [110, 130].includes(currentValues?.status),
        dropdownMatchSelectWidth: false,
        options: [
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.VerticalLine'),
            value: '124',
          },
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.Comma'),
            value: '44',
          },
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.DoubleQuotes'),
            value: '34',
          },
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.Asterisk'),
            value: '42',
          },
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.Space'),
            value: '32',
          },
          {
            label: i18n.t('components.AccessHelper.FieldsConfig.dataFields.Semicolon'),
            value: '59',
          },
        ],
        useInput: true,
        useInputProps: {
          placeholder: 'ASCII',
          disabled: isEdit && [110, 130].includes(currentValues?.status),
        },
        style: { width: 100 },
      },
      rules: [
        {
          required: true,
          type: 'number',
          transform: val => +val,
          min: 0,
          max: 127,
        } as any,
      ],
    },
    {
      type: (
        <EditableTable
          size="small"
          columns={getHiveColumns(dataType, currentValues)}
          canDelete={(record, idx, isNew) => !isEdit || isNew}
        />
      ),
      name: 'fieldList',
    },
  ];

  return type === 'col'
    ? getColsFromFields(fileds)
    : fileds.map(item => excludeObject(['_col'], item));
};
