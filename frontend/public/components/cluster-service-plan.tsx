import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow, Table, Vr, Vd } from './factory';
import { SectionHeading, detailsPage, navFactory, ResourceLink, ResourceSummary } from './utils';
import { K8sResourceKind, referenceForModel, servicePlanDisplayName } from '../module/k8s';
import { ClusterServicePlanModel, ClusterServiceBrokerModel, ClusterServiceClassModel } from '../models';
import { viewYamlComponent } from './utils/horizontal-nav';

const tableColumnClasses = [
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
];

const ClusterServicePlanHeader: React.SFC<ClusterServicePlanHeaderProps> = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="spec.externalName">External Name</ColHead>
  <ColHead {...props} className="col-sm-4 hidden-xs" sortField="spec.clusterServiceBrokerName">Broker</ColHead>
</ListHeader>;

export const ClusterServicePlanTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
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
ClusterServicePlanTableHeader.displayName = 'ClusterServicePlanTableHeader';

const ClusterServicePlanListRow: React.SFC<ClusterServicePlanRowProps> = ({obj: servicePlan}) => <ResourceRow obj={servicePlan}>
  <div className="col-sm-4 col-xs-6">
    <ResourceLink kind={referenceForModel(ClusterServicePlanModel)} name={servicePlan.metadata.name} displayName={servicePlan.spec.externalName} />
  </div>
  <div className="col-sm-4 col-xs-6">
    {servicePlan.spec.externalName}
  </div>
  <div className="col-sm-4 hidden-xs co-break-word">
    <ResourceLink kind={referenceForModel(ClusterServiceBrokerModel)} name={servicePlan.spec.clusterServiceBrokerName} title={servicePlan.spec.clusterServiceBrokerName} />
  </div>
</ResourceRow>;

const ClusterServicePlanTableRow: React.FC<ClusterServicePlanTableRowProps> = ({obj: servicePlan, index, key, style}) => {
  return (
    <Vr id={servicePlan.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={referenceForModel(ClusterServicePlanModel)} name={servicePlan.metadata.name} displayName={servicePlan.spec.externalName} />
      </Vd>
      <Vd className={tableColumnClasses[1]}>
        {servicePlan.spec.externalName}
      </Vd>
      <Vd className={classNames(tableColumnClasses[2], 'co-break-word')}>
        <ResourceLink kind={referenceForModel(ClusterServiceBrokerModel)} name={servicePlan.spec.clusterServiceBrokerName} title={servicePlan.spec.clusterServiceBrokerName} />
      </Vd>
    </Vr>
  );
};
ClusterServicePlanTableRow.displayName = 'ClusterServicePlanTableRow';
export type ClusterServicePlanTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
};

const ClusterServicePlanDetails: React.SFC<ClusterServicePlanDetailsProps> = ({obj: servicePlan}) => {
  return <div className="co-m-pane__body">
    <SectionHeading text="Service Plan Overview" />
    <div className="row">
      <div className="col-md-6">
        <ResourceSummary resource={servicePlan} />
      </div>
      <div className="col-md-6">
        <dl className="co-m-pane__details">
          <dt>Description</dt>
          <dd>{servicePlan.spec.description}</dd>
          <dt>Broker</dt>
          <dd><ResourceLink kind={referenceForModel(ClusterServiceBrokerModel)} name={servicePlan.spec.clusterServiceBrokerName} /></dd>
          <dt>Service Class</dt>
          <dd><ResourceLink kind={referenceForModel(ClusterServiceClassModel)} name={servicePlan.spec.clusterServiceClassRef.name} /></dd>
          {servicePlan.status.removedFromBrokerCatalog && <React.Fragment>
            <dt>Removed From Catalog</dt>
            <dd>{servicePlan.status.removedFromBrokerCatalog}</dd>
          </React.Fragment>}
        </dl>
      </div>
    </div>
  </div>;
};

export const ClusterServicePlanDetailsPage: React.SFC<ClusterServicePlanDetailsPageProps> = props => <DetailsPage
  {...props}
  titleFunc={servicePlanDisplayName}
  kind={referenceForModel(ClusterServicePlanModel)}
  pages={[
    navFactory.details(detailsPage(ClusterServicePlanDetails)),
    navFactory.editYaml(viewYamlComponent),
  ]}
/>;

export const ClusterServicePlanList: React.SFC = props => <React.Fragment>
  <Table {...props} aria-label="Cluster Service Plans" Header={ClusterServicePlanTableHeader} Row={ClusterServicePlanTableRow} virtualize />
  {false && <List {...props} Header={ClusterServicePlanHeader} Row={ClusterServicePlanListRow} /> }
</React.Fragment>;

export const ClusterServicePlanPage: React.SFC<ClusterServicePlanPageProps> = props =>
  <ListPage
    {...props}
    ListComponent={ClusterServicePlanList}
    kind={referenceForModel(ClusterServicePlanModel)}
    canCreate={false}
  />;

export type ClusterServicePlanRowProps = {
  obj: K8sResourceKind
};

export type ClusterServicePlanHeaderProps = {
  obj: K8sResourceKind
};

export type ClusterServicePlanPageProps = {
  showTitle?: boolean,
  fieldSelector?: string
};

export type ClusterServicePlanDetailsProps = {
  obj: K8sResourceKind
};

export type ClusterServicePlanDetailsPageProps = {
  match: any
};
