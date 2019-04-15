import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import { Kebab, navFactory, ResourceKebab, ResourceLink, ResourceSummary, SectionHeading } from './utils';
import { K8sResourceKind, referenceForCRD } from '../module/k8s';

const { common } = Kebab.factory;

const crdInstancesPath = crd => _.get(crd, 'spec.scope') === 'Namespaced'
  ? `/k8s/all-namespaces/${referenceForCRD(crd)}`
  : `/k8s/cluster/${referenceForCRD(crd)}`;

const instances = (kind, obj) => ({
  label: 'View Instances',
  href: crdInstancesPath(obj),
});

const menuActions = [instances, ...common];

const tableColumnClasses = [
  classNames('pf-m-3-col-on-xl', 'pf-m-4-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-3-col-on-xl', 'pf-m-4-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-2-col-on-xl', 'pf-m-hidden', 'pf-m-visible-on-xl'),
  Kebab.columnClass,
];

const CRDHeader = props => <ListHeader>
  <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 col-xs-6" sortField="spec.names.kind">Name</ColHead>
  <ColHead {...props} className="col-lg-3 col-md-4 col-sm-4 col-xs-6" sortField="spec.group">Group</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 hidden-xs" sortField="spec.version">Version</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.scope">Namespaced</ColHead>
  <ColHead {...props} className="col-lg-2 hidden-md hidden-sm hidden-xs">Established</ColHead>
</ListHeader>;

export const CRDTableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'spec.names.kind', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Group', sortField: 'spec.group', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Version', sortField: 'spec.version', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Namespaced', sortField: 'spec.scope', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    { title: 'Established', props: { className: tableColumnClasses[4]}},
    { title: '', props: { className: tableColumnClasses[5]}},
  ];
};
CRDTableHeader.displayName = 'CRDTableHeader';

const isEstablished = conditions => {
  const condition = _.find(conditions, c => c.type === 'Established');
  return condition && condition.status === 'True';
};

const namespaced = crd => crd.spec.scope === 'Namespaced';

const CRDRow = ({obj: crd}) => <div className="row co-resource-list__item">
  <div className="col-lg-3 col-md-4 col-sm-4 col-xs-6">
    <span className="co-resource-item">
      <ResourceLink kind="CustomResourceDefinition" name={crd.metadata.name} namespace={crd.metadata.namespace} displayName={_.get(crd, 'spec.names.kind')} />
    </span>
  </div>
  <div className="col-lg-3 col-md-4 col-sm-4 col-xs-6 co-break-word">
    { crd.spec.group }
  </div>
  <div className="col-lg-2 col-md-2 col-sm-4 hidden-xs">
    { crd.spec.version }
  </div>
  <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
    { namespaced(crd) ? 'Yes' : 'No' }
  </div>
  <div className="col-lg-2 hidden-md hidden-sm hidden-xs">
    {
      isEstablished(crd.status.conditions)
        ? <span><i className="pficon pficon-ok" aria-hidden="true"></i></span>
        : <span><i className="fa fa-ban" aria-hidden="true"></i></span>
    }
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind="CustomResourceDefinition" resource={crd} />
  </div>
</div>;

const CRDTableRow: React.FC<CRDTableRowProps> = ({obj: crd, index, key, style}) => {
  return (
    <Vr id={crd.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <span className="co-resource-item">
          <ResourceLink kind="CustomResourceDefinition" name={crd.metadata.name} namespace={crd.metadata.namespace} displayName={_.get(crd, 'spec.names.kind')} />
        </span>
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        { crd.spec.group }
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        { crd.spec.version }
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        { namespaced(crd) ? 'Yes' : 'No' }
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        {
          isEstablished(crd.status.conditions)
            ? <span><i className="pficon pficon-ok" aria-hidden="true"></i></span>
            : <span><i className="fa fa-ban" aria-hidden="true"></i></span>
        }
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind="CustomResourceDefinition" resource={crd} />
      </Vd>
    </Vr>
  );
};
CRDTableRow.displayName = 'CRDTableRow';
export type CRDTableRowProps = {
  obj: K8sResourceKind;
  index: number;
  key?: string;
  style: object;
};

const Details = ({obj: crd}) => {
  return <div className="co-m-pane__body">
    <SectionHeading text="Custom Resource Definition Overview" />
    <ResourceSummary showPodSelector={false} showNodeSelector={false} resource={crd} />
  </div>;
};

export const CustomResourceDefinitionsList: React.SFC<CustomResourceDefinitionsListProps> = props => <React.Fragment>
  <Table {...props} aria-label="Custom Resource Definitions" Header={CRDTableHeader} Row={CRDTableRow} defaultSortField="spec.names.kind" virtualize />
  {false && <List {...props} Header={CRDHeader} Row={CRDRow} defaultSortField="spec.names.kind" />}
</React.Fragment>;

export const CustomResourceDefinitionsPage: React.SFC<CustomResourceDefinitionsPageProps> = props => <ListPage {...props} ListComponent={CustomResourceDefinitionsList} kind="CustomResourceDefinition" canCreate={true} />;
export const CustomResourceDefinitionsDetailsPage = props => <DetailsPage {...props} menuActions={menuActions} pages={[navFactory.details(Details), navFactory.editYaml()]} />;

export type CustomResourceDefinitionsListProps = {

};

export type CustomResourceDefinitionsPageProps = {

};

CustomResourceDefinitionsList.displayName = 'CustomResourceDefinitionsList';
CustomResourceDefinitionsPage.displayName = 'CustomResourceDefinitionsPage';
