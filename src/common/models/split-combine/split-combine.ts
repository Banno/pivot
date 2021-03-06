'use strict';

import { List } from 'immutable';
import { Class, Instance, isInstanceOf } from 'immutable-class';
import { Timezone, Duration, day, hour } from 'chronoshift';
import { $, Expression, ChainExpression, ExpressionJS, Action, ActionJS, SortAction, LimitAction, TimeBucketAction, TimeRange } from 'plywood';
import { DataSource } from '../data-source/data-source';
import { Dimension } from '../dimension/dimension';

export interface SplitCombineValue {
  expression: Expression;
  bucketAction: Action;
  sortAction: SortAction;
  limitAction: LimitAction;
}

export interface SplitCombineJS {
  expression: ExpressionJS;
  bucketAction?: ActionJS;
  sortAction?: ActionJS;
  limitAction?: ActionJS;
}

var check: Class<SplitCombineValue, SplitCombineJS>;
export class SplitCombine implements Instance<SplitCombineValue, SplitCombineJS> {
  static isSplitCombine(candidate: any): boolean {
    return isInstanceOf(candidate, SplitCombine);
  }

  static fromExpression(expression: Expression): SplitCombine {
    return new SplitCombine({
      expression,
      bucketAction: null,
      sortAction: null,
      limitAction: null
    });
  }

  static fromJS(parameters: SplitCombineJS): SplitCombine {
    var value: SplitCombineValue = {
      expression: Expression.fromJS(parameters.expression),
      bucketAction: null,
      sortAction: null,
      limitAction: null
    };

    if (parameters.bucketAction) value.bucketAction = Action.fromJS(parameters.bucketAction);
    if (parameters.sortAction) value.sortAction = SortAction.fromJS(parameters.sortAction);
    if (parameters.limitAction) value.limitAction = LimitAction.fromJS(parameters.limitAction);
    return new SplitCombine(value);
  }


  public expression: Expression;
  public bucketAction: Action;
  public sortAction: SortAction;
  public limitAction: LimitAction;

  constructor(parameters: SplitCombineValue) {
    this.expression = parameters.expression;
    this.bucketAction = parameters.bucketAction;
    this.sortAction = parameters.sortAction;
    this.limitAction = parameters.limitAction;
  }

  public valueOf(): SplitCombineValue {
    return {
      expression: this.expression,
      bucketAction: this.bucketAction,
      sortAction: this.sortAction,
      limitAction: this.limitAction
    };
  }

  public toJS(): SplitCombineJS {
    var js: SplitCombineJS = {
      expression: this.expression.toJS()
    };
    if (this.bucketAction) js.bucketAction = this.bucketAction.toJS();
    if (this.sortAction) js.sortAction = this.sortAction.toJS();
    if (this.limitAction) js.limitAction = this.limitAction.toJS();
    return js;
  }

  public toJSON(): SplitCombineJS {
    return this.toJS();
  }

  public toString(): string {
    return `[SplitCombine: ${this.expression}]`;
  }

  public equals(other: SplitCombine): boolean {
    var { expression, bucketAction, sortAction, limitAction } = this;
    return SplitCombine.isSplitCombine(other) &&
      expression.equals(other.expression) &&
      Boolean(bucketAction) === Boolean(other.bucketAction) &&
      (!bucketAction || bucketAction.equals(other.bucketAction)) &&
      Boolean(sortAction) === Boolean(other.sortAction) &&
      (!sortAction || sortAction.equals(other.sortAction)) &&
      Boolean(limitAction) === Boolean(other.limitAction) &&
      (!limitAction || limitAction.equals(other.limitAction));
  }

  public toSplitExpression(): Expression {
    var { expression, bucketAction } = this;
    if (!bucketAction) return expression;
    return expression.performAction(bucketAction);
  }

  public toKey(): string {
    return this.toSplitExpression().toString();
  }

  public changeBucketAction(bucketAction: Action): SplitCombine {
    var value = this.valueOf();
    value.bucketAction = bucketAction;
    return new SplitCombine(value);
  }

  public changeSort(sortAction: SortAction): SplitCombine {
    var value = this.valueOf();
    value.sortAction = sortAction;
    return new SplitCombine(value);
  }

  public getDimension(dataSource: DataSource): Dimension {
    return dataSource.getDimensionByExpression(this.expression);
  }

  public getBucketTitle(): string {
    var bucketAction = this.bucketAction;
    if (bucketAction instanceof TimeBucketAction) {
      var duration = bucketAction.duration.toString();
      switch (duration) {
        case 'P1D': return ' (Day)';
        case 'PT1H': return ' (Hour)';
        case 'PT1M': return ' (Minute)';
        default: return '';
      }
    }
    return '';
  }

  public getTitle(dataSource: DataSource): string {
    var dimension = this.getDimension(dataSource);
    return (dimension ? dimension.title : '?') + this.getBucketTitle();
  }
}
