import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, List, ListHeader, ListPage, ResourceRow, Table, Vr, Vd } from './factory';
import { Kebab, LabelList, ResourceKebab, ResourceLink, Selector } from './utils';
import { PrometheusModel } from '../models';
import { referenceForModel } from '../module/k8s';

const {Edit, Delete, ModifyCount} = Kebab.factory;
const menuActions = [ModifyCount, Edit, Delete];

const tableColumnClasses = [
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-3-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-4-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-1-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-2-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  Kebab.columnClass,
];

const PrometheusRow = ({obj: instance}) => {
  const {metadata, spec} = instance;

  return <ResourceRow obj={instance}>
    <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6">
      <ResourceLink kind={referenceForModel(PrometheusModel)} name={metadata.name} namespace={metadata.namespace} title={metadata.uid} />
    </div>
    <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6">
      <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.namespace} />
    </div>
    <div className="col-lg-3 col-md-4 col-sm-4 hidden-xs">
      <LabelList kind={PrometheusModel.kind} labels={metadata.labels} />
    </div>
    <div className="col-lg-1 col-md-2 hidden-sm hidden-xs">{spec.version}</div>
    <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
      <Selector selector={spec.serviceMonitorSelector} kind="ServiceMonitor" namespace={metadata.namespace} />
    </div>
    <div className="dropdown-kebab-pf">
      <ResourceKebab actions={menuActions} kind={referenceForModel(PrometheusModel)} resource={instance} />
    </div>
  </ResourceRow>;
};

const PrometheusTableRow = ({obj: instance, index, key, style}) => {
  const {metadata, spec} = instance;
  return (
    <Vr id={instance.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={referenceForModel(PrometheusModel)} name={metadata.name} namespace={metadata.namespace} title={metadata.uid} />
      </Vd>
      <Vd className={tableColumnClasses[1]}>
        <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <LabelList kind={PrometheusModel.kind} labels={metadata.labels} />
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        {spec.version}
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        <Selector selector={spec.serviceMonitorSelector} kind="ServiceMonitor" namespace={metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={referenceForModel(PrometheusModel)} resource={instance} />
      </Vd>
    </Vr>
  );
};
PrometheusTableRow.displayName = 'PrometheusTableRow';

const PrometheusHeader = props => <ListHeader>
  <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-lg-3 col-md-3 col-sm-4 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 hidden-xs" sortField="metadata.labels">Labels</ColHead>
  <ColHead {...props} className="col-lg-1 col-md-2 hidden-sm hidden-xs" sortField="spec.version">Version</ColHead>
  <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs" sortField="spec.serviceMonitorSelector">
    Service Monitor Selector
  </ColHead>
</ListHeader>;

export const PrometheusTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Version', sortField: 'spec.version', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    {
      title: 'Service Monitor Selector', sortField: 'spec.serviceMonitorSelector', transforms: [sortable],
      props: { className: tableColumnClasses[4]},
    },
    { title: '',
      props: { className: tableColumnClasses[5]},
    },
  ];
};
PrometheusTableHeader.displayName = 'PrometheusTableHeader';

export const PrometheusInstancesList = props => <React.Fragment>
  <Table {...props} aria-label="Promethesuses" Header={PrometheusTableHeader} Row={PrometheusTableRow} virtualize />
  {false && <List {...props} Header={PrometheusHeader} Row={PrometheusRow} />}
</React.Fragment>;
export const PrometheusInstancesPage = props => <ListPage {...props} ListComponent={PrometheusInstancesList} canCreate={true} kind={referenceForModel(PrometheusModel)} />;
