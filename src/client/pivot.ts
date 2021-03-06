'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import { Timezone, WallTime } from 'chronoshift';
import { $, Expression, Datum, Dataset, TimeRange, AttributeInfo } from 'plywood';

import { queryUrlExecutorFactory } from './utils/ajax/ajax';
import { Filter, Dimension, Measure, SplitCombine, Clicker, DataSource, DataSourceJS } from '../common/models/index';
import { PivotApplication } from "./components/index";


export interface PivotOptions {
  dataSources: List<DataSource>;
}

export function pivot(container: Element, options: PivotOptions) {
  React.render(
    React.createElement(PivotApplication, {
      dataSources: options.dataSources
    }),
    container
  );
}
