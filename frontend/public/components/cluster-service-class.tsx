import * as React from 'react';
import { Link } from 'react-router-dom';
import * as _ from 'lodash-es';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow, Table, Vr, Vd } from './factory';
import { history, SectionHeading, detailsPage, navFactory, ResourceSummary, resourcePathFromModel, ResourceLink } from './utils';
import { viewYamlComponent } from './utils/horizontal-nav';
import { ClusterServiceClassModel, ClusterServiceBrokerModel } from '../models';
import { K8sResourceKind, referenceForModel, serviceClassDisplayName } from '../module/k8s';
import { ClusterServiceClassIcon } from './catalog/catalog-item-icon';
import { ClusterServicePlanPage } from './cluster-service-plan';
import { ClusterServiceClassInfo } from './cluster-service-class-info';

const createInstance = (kindObj, serviceClass) => {
  if (!_.get(serviceClass, 'status.removedFromBrokerCatalog')) {
    return {
      btnClass: 'btn-primary',
      callback: () => {
        history.push(`/catalog/create-service-instance?cluster-service-class=${serviceClass.metadata.name}`);
      },
      label: 'Create Instance',
    };
  }
};

const actionButtons = [
  createInstance,
];

const tableColumnClasses = [
  classNames('pf-m-6-col-on-md', 'pf-m-12-col-on-sm'),
  classNames('pf-m-3-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-3-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
];

const ClusterServiceClassHeader: React.SFC<ClusterServiceClassHeaderProps> = props => <ListHeader>
  <ColHead {...props} className="col-sm-6 col-xs-12" sortFunc="serviceClassDisplayName" currentSortFunc="serviceClassDisplayName">Display Name</ColHead>
  <ColHead {...props} className="col-sm-3 hidden-xs" sortField="spec.externalName">External Name</ColHead>
  <ColHead {...props} className="col-sm-3 hidden-xs" sortField="spec.clusterServiceBrokerName">Broker</ColHead>
</ListHeader>;

export const ClusterServiceClassTableHeader = () => {
  return [
    {
      title: 'Display Name', sortFunc: 'serviceClassDisplayName', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'External Name', sortField: 'spec.externalName', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Broker', sortField: 'spec.clusterServiceBrokerName', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
  ];
};
ClusterServiceClassTableHeader.displayName = 'ClusterServiceClassTableHeader';

const ClusterServiceClassListRow: React.SFC<ClusterServiceClassRowProps> = ({obj: serviceClass}) => {
  const path = resourcePathFromModel(ClusterServiceClassModel, serviceClass.metadata.name);
  return <ResourceRow obj={serviceClass}>
    <div className="col-sm-6 col-xs-12">
      <ClusterServiceClassIcon serviceClass={serviceClass} />
      <Link className="co-cluster-service-class-link" to={path}>{serviceClassDisplayName(serviceClass)}</Link>
    </div>
    <div className="col-sm-3 hidden-xs">
      {serviceClass.spec.externalName}
    </div>
    <div className="col-sm-3 hidden-xs co-break-word">
      <ResourceLink kind={referenceForModel(ClusterServiceBrokerModel)} name={serviceClass.spec.clusterServiceBrokerName} />
    </div>
  </ResourceRow>;
};

const ClusterServiceClassTableRow: React.FC<ClusterServiceClassTableRowProps> = ({obj: serviceClass, index, key, style}) => {
  const path = resourcePathFromModel(ClusterServiceClassModel, serviceClass.metadata.name);
  return (
    <Vr id={serviceClass.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ClusterServiceClassIcon serviceClass={serviceClass} />
        <Link className="co-cluster-service-class-link" to={path}>{serviceClassDisplayName(serviceClass)}</Link>
      </Vd>
      <Vd className={tableColumnClasses[1]}>
        {serviceClass.spec.externalName}
      </Vd>
      <Vd className={classNames(tableColumnClasses[2], 'co-break-word')}>
        <ResourceLink kind={referenceForModel(ClusterServiceBrokerModel)} name={serviceClass.spec.clusterServiceBrokerName} />
      </Vd>
    </Vr>
  );
};
ClusterServiceClassTableRow.displayName = 'ClusterServiceClassTableRow';
export type ClusterServiceClassTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
};


const ClusterServiceClassDetails: React.SFC<ClusterServiceClassDetailsProps> = ({obj: serviceClass}) => <div className="co-m-pane__body">
  <div className="row">
    <div className="col-md-7 col-md-push-5" style={{marginBottom: '20px'}}>
      <ClusterServiceClassInfo obj={serviceClass} />
    </div>
    <div className="col-md-5 col-md-pull-7">
      <SectionHeading text="Service Class Overview" />
      <ResourceSummary resource={serviceClass}>
        <dt>External Name</dt>
        <dd>{serviceClass.spec.externalName || '-'}</dd>
      </ResourceSummary>
      {serviceClass.status.removedFromBrokerCatalog && <React.Fragment>
        <dt>Removed From Catalog</dt>
        <dd>{serviceClass.status.removedFromBrokerCatalog}</dd>
      </React.Fragment>}
    </div>
  </div>
</div>;

export const ClusterServiceClassDetailsPage: React.SFC<ClusterServiceClassDetailsPageProps> = props => <DetailsPage
  {...props}
  buttonActions={actionButtons}
  titleFunc={serviceClassDisplayName}
  kind={referenceForModel(ClusterServiceClassModel)}
  pages={[navFactory.details(detailsPage(ClusterServiceClassDetails)),
    navFactory.editYaml(viewYamlComponent),
    navFactory.clusterServicePlans(({obj}) => <ClusterServicePlanPage showTitle={false}
      fieldSelector={`spec.clusterServiceClassRef.name=${obj.metadata.name}`} />)]}
/>;

export const ClusterServiceClassList: React.SFC = props => <React.Fragment>
  <Table {...props} aria-label="Cluster Service Classes" Header={ClusterServiceClassTableHeader} Row={ClusterServiceClassTableRow} defaultSortFunc="serviceClassDisplayName" virtualize />
  {false && <List {...props} Header={ClusterServiceClassHeader} Row={ClusterServiceClassListRow} defaultSortFunc="serviceClassDisplayName" /> }
</React.Fragment>;

export const ClusterServiceClassPage: React.SFC<ClusterServiceClassPageProps> = props =>
  <ListPage
    {...props}
    showTitle={false}
    ListComponent={ClusterServiceClassList}
    kind={referenceForModel(ClusterServiceClassModel)}
    textFilter="service-class"
    canCreate={false}
  />;

export type ClusterServiceClassRowProps = {
  obj: K8sResourceKind
};

export type ClusterServiceClassHeaderProps = {
  obj: K8sResourceKind
};

export type ClusterServiceClassPageProps = {
  showTitle?: boolean,
  fieldSelector?: string
};

export type ClusterServiceClassDetailsProps = {
  obj: K8sResourceKind,
};

export type ClusterServiceClassDetailsPageProps = {
  match: any,
  name: string,
};
