import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, ResourceRow, Table, Vr, Vd } from './factory';
import { ConfigMapData } from './configmap-and-secret-data';
import { Kebab, SectionHeading, navFactory, ResourceKebab, ResourceLink, ResourceSummary } from './utils';
import { fromNow } from './utils/datetime';

const menuActions = Kebab.factory.common;

const kind = 'ConfigMap';

const tableColumnClasses = [
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-1-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-3-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  Kebab.columnClass,
];

const ConfigMapHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-sm-1 hidden-xs" sortFunc="dataSize">Size</ColHead>
  <ColHead {...props} className="col-sm-3 hidden-xs" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

export const ConfigMapTableHeader = () => {
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
      title: 'Size', sortFunc: 'dataSize', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Created', sortField: 'metadata.creationTimestamp', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    { title: '',
      props: { className: tableColumnClasses[4]},
    },
  ];
};
ConfigMapTableHeader.displayName = 'ConfigMapTableHeader';

const ConfigMapRow = ({obj: configMap}) => <ResourceRow obj={configMap}>
  <div className="col-sm-4 col-xs-6">
    <ResourceLink kind={kind} name={configMap.metadata.name} namespace={configMap.metadata.namespace} title={configMap.metadata.uid} />
  </div>
  <div className="col-sm-4 col-xs-6 co-break-word">
    <ResourceLink kind="Namespace" name={configMap.metadata.namespace} title={configMap.metadata.namespace} />
  </div>
  <div className="col-sm-1 hidden-xs">{_.size(configMap.data)}</div>
  <div className="col-sm-3 hidden-xs">{fromNow(configMap.metadata.creationTimestamp)}</div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind={kind} resource={configMap} />
  </div>
</ResourceRow>;

const ConfigMapTableRow = ({obj: configMap, index, key, style}) => {
  return (
    <Vr id={configMap.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind="ConfigMap" name={configMap.metadata.name} namespace={configMap.metadata.namespace} title={configMap.metadata.uid} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        <ResourceLink kind="Namespace" name={configMap.metadata.namespace} title={configMap.metadata.namespace} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        {_.size(configMap.data)}
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        {fromNow(configMap.metadata.creationTimestamp)}
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={configMap} />
      </Vd>
    </Vr>
  );
};
ConfigMapTableRow.displayName = 'ConfigMapTableRow';


const ConfigMapDetails = ({obj: configMap}) => {
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text="Config Map Overview" />
      <ResourceSummary resource={configMap} />
    </div>
    <div className="co-m-pane__body">
      <SectionHeading text="Data" />
      <ConfigMapData data={configMap.data} />
    </div>
  </React.Fragment>;
};

const ConfigMaps = props => <React.Fragment>
  <Table {...props} aria-label="Config Maps" Header={ConfigMapTableHeader} Row={ConfigMapTableRow} virtualize />
  {false && <List {...props} Header={ConfigMapHeader} Row={ConfigMapRow} />}
</React.Fragment>;
const ConfigMapsPage = props => <ListPage ListComponent={ConfigMaps} canCreate={true} {...props} />;
const ConfigMapsDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(ConfigMapDetails), navFactory.editYaml()]}
/>;

export {ConfigMaps, ConfigMapsPage, ConfigMapsDetailsPage};
