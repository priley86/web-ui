import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import { Table } from './factory';
import { Timestamp } from './utils';
import { CamelCaseWrap } from './utils/camel-case-wrap';

export const Conditions: React.SFC<ConditionsProps> = ({conditions}) => {
  const ConditionsTableHeader = () => {
    return [
      {
        title: 'Type', transforms: [sortable],
      },
      {
        title: 'Status', transforms: [sortable],
      },
      {
        title: 'Updated', transforms: [sortable],
      },
      {
        title: 'Reason', transforms: [sortable],
      },
      {
        title: 'Message', transforms: [sortable],
      },
    ];
  };

  const ConditionsTableRows = ({componentProps}) => {
    return _.map(componentProps.data, (condition) => {
      return [
        { title: <CamelCaseWrap value={condition.type} /> },
        { title: condition.status },
        { title: <Timestamp timestamp={condition.lastUpdateTime || condition.lastTransitionTime} /> },
        { title: <CamelCaseWrap value={condition.reason} /> },
        /* remove initial newline which appears in route messages */
        { title: _.trim(condition.message) || '-', props: { className: 'co-pre-line' } },
      ];
    });
  };

  return <React.Fragment>
    {conditions
      ? <Table
          aria-label="Conditions"
          data={conditions}
          Header={ConditionsTableHeader}
          Rows={ConditionsTableRows}
          virtualize={false}
          loaded={true} />
      : <div className="cos-status-box">
        <div className="text-center">No Conditions Found</div>
      </div>}
  </React.Fragment>;
};

export type conditionProps = {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastUpdateTime?: string;
  lastTransitionTime?: string;
};

export type ConditionsProps = {
  conditions: conditionProps[];
  title?: string;
  subTitle?: string;
};
