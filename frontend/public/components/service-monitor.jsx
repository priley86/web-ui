import * as _ from 'lodash-es';
import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { ColHead, List, ListHeader, ListPage, ResourceRow, Table, Vr, Vd } from './factory';
import { Kebab, ResourceKebab, ResourceLink, Selector } from './utils';
import { ServiceMonitorModel } from '../models';
import { referenceForModel } from '../module/k8s';

const {Edit, Delete} = Kebab.factory;
const menuActions = [Edit, Delete];

const namespaceSelectorLinks = ({spec}) => {
  const namespaces = _.get(spec, 'namespaceSelector.matchNames', []);
  if (namespaces.length) {
    return _.map(namespaces, n => <span key={n}><ResourceLink kind="Namespace" name={n} title={n} />&nbsp;&nbsp;</span>);
  }
  return <span className="text-muted">--</span>;
};

const serviceSelectorLinks = ({spec}) => {
  const namespaces = _.get(spec, 'namespaceSelector.matchNames', []);
  if (namespaces.length) {
    return _.map(namespaces, n => <span key={n}><Selector selector={spec.selector} kind="Service" namespace={n} />&nbsp;&nbsp;</span>);
  }
  return <Selector selector={spec.selector} kind="Service" />;
};

const tableColumnClasses = [
  classNames('pf-m-3-col-on-lg', 'pf-m-3-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-lg', 'pf-m-3-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-lg', 'pf-m-6-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-3-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  Kebab.columnClass,
];

const ServiceMonitorRow = ({obj: sm}) => {
  const {metadata} = sm;

  return <ResourceRow obj={sm}>
    <div className="col-md-3 col-sm-3 col-xs-6">
      <ResourceLink kind={referenceForModel(ServiceMonitorModel)} name={metadata.name} namespace={metadata.namespace} title={metadata.uid} />
    </div>
    <div className="col-md-3 col-sm-3 col-xs-6">
      <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.namespace} />
    </div>
    <div className="col-md-3 col-sm-6 hidden-xs">
      { serviceSelectorLinks(sm) }
    </div>
    <div className="col-md-3 hidden-sm hidden-xs">
      <p>
        { namespaceSelectorLinks(sm) }
      </p>
    </div>
    <div className="dropdown-kebab-pf">
      <ResourceKebab actions={menuActions} kind={referenceForModel(ServiceMonitorModel)} resource={sm} />
    </div>
  </ResourceRow>;
};

export const ServiceMonitorTableRow = ({obj: sm, index, key, style}) => {
  const {metadata} = sm;
  return (
    <Vr id={sm.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={referenceForModel(ServiceMonitorModel)} name={metadata.name} namespace={metadata.namespace} title={metadata.uid} />
      </Vd>
      <Vd className={tableColumnClasses[1]}>
        <ResourceLink kind="Namespace" name={metadata.namespace} title={metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        { serviceSelectorLinks(sm) }
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <p>
          { namespaceSelectorLinks(sm) }
        </p>
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={referenceForModel(ServiceMonitorModel)} resource={sm} />
      </Vd>
    </Vr>
  );
};
ServiceMonitorTableRow.displayName = 'ServiceMonitorTableRow';

const ServiceMonitorHeader = props => <ListHeader>
  <ColHead {...props} className="col-md-3 col-sm-3 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-md-3 col-sm-3 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-md-3 col-sm-6 hidden-xs" sortField="spec.selector">Service Selector</ColHead>
  <ColHead {...props} className="col-md-3 hidden-sm hidden-xs" sortField="spec.namespaceSelector">
    Monitoring Namespace
  </ColHead>
</ListHeader>;

export const ServiceMonitorTableHeader = () => {
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
      title: 'Service Selector', sortField: 'spec.selector', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Monitoring Namespace', sortField: 'spec.namespaceSelector', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    {
      title: '',
      props: { className: tableColumnClasses[4]},
    },
  ];
};
ServiceMonitorTableHeader.displayName = 'ServiceMonitorTableHeader';

export const ServiceMonitorsList = props => <React.Fragment>
  <Table {...props} aria-label="Service Monitors" Header={ServiceMonitorTableHeader} Row={ServiceMonitorTableRow} virtualize />
  {false && <List {...props} Header={ServiceMonitorHeader} Row={ServiceMonitorRow} /> }
</React.Fragment>;

export const ServiceMonitorsPage = props => <ListPage
  {...props}
  canCreate={true}
  kind={referenceForModel(ServiceMonitorModel)}
  ListComponent={ServiceMonitorsList}
/>;
