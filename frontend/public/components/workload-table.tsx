import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { K8sResourceKind } from '../module/k8s';
import {
  Vr,
  Vd,
} from './factory';

import {
  Kebab,
  KebabAction,
  LabelList,
  ResourceKebab,
  ResourceLink,
  resourcePath,
  Selector,
} from './utils';

const tableColumnClasses = [
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-4-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-3-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  Kebab.columnClass,
];

export const WorkloadTableRow: React.FC<DeploymentConfigTableRowProps> = ({obj, index, key, style, kind, menuActions}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.uid} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <LabelList kind={kind} labels={obj.metadata.labels} />
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <Link to={`${resourcePath(kind, obj.metadata.name, obj.metadata.namespace)}/pods`} title="pods">
          {obj.status.replicas || 0} of {obj.spec.replicas} pods
        </Link>
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        <Selector selector={obj.spec.selector} namespace={obj.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </Vd>
    </Vr>
  );
};
WorkloadTableRow.displayName = 'DeploymentTableRow';
export type DeploymentConfigTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
  kind: string;
  menuActions: KebabAction[]
};

export const WorkloadTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1] },
    },
    {
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      props: { className: tableColumnClasses[2] },
    },
    {
      title: 'Status', sortFunc: 'numReplicas', transforms: [sortable],
      props: { className: tableColumnClasses[3] },
    },
    { title: 'Pod Selector', sortField: 'spec.selector', transforms: [sortable],
      props: { className: tableColumnClasses[4] },
    },
    {
      title: '', props: { className: tableColumnClasses[5] },
    },
  ];
};
WorkloadTableHeader.displayName = 'DeploymentConfigTableHeader';
