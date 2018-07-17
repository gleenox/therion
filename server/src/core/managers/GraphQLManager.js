import _ from "lodash";
import debug from "debug";
import { attributeFields } from "graphql-sequelize";

import Controller from "../base/Controller";

const log = debug("therion:server:core:GraphQLManager");

class GraphQLManager {
	initialize = (models, controllers, modelDefs) => {
		log("Initialized!");

		this._models = models;
		this._modelDefs = modelDefs;
		this._controllers = _.transform(models, (r, v, k) => {
			const type = controllers[k] || Controller;
			r[k] = new type(v, modelDefs[k]);
		}, {});
		this._query = this._getQuery();
		this._querySchema = this._getQuerySchema();
		this._customTypesSchema = this._getCustomTypesSchema();
		this._mutation = this._getMutation();
		this._mutationSchema = this._getMutationSchema();

		return this;
	}

	get query() {
		return this._query;
	}

	get querySchema() {
		return this._querySchema;
	}

	get mutation() {
		return this._mutation;
	}

	get mutationSchema() {
		return this._mutationSchema;
	}

	get customTypesSchema() {
		return this._customTypesSchema;
	}

	_getQuery = () => {
		const query = {};

		_.map(this._controllers, (v) => {
			_.assignIn(query, v.getQuery());
		});

		return query;
	}

	_getMutation = () => {
		const mutation = {};

		_.map(this._controllers, (v) => {
			_.assignIn(mutation, v.getMutation());
		});

		return mutation;
	}

	_getQuerySchema = () => {
		const query = _.transform(this._controllers, (r, v) => {
			r.push(v.getQuerySchema());
		}, []).join("\n");

		return `
		type Query {
			${ query }
		}
		`;
	}

	_getMutationSchema = () => {
		const mutation = _.transform(this._controllers, (r, v) => {
			r.push(v.getMutationSchema());
		}, []).join("\n");

		return `
		type Mutation {
			${ mutation }
		}
		`;
	}

	_getCustomTypesSchema = () => {
		return _.transform(this._models, (gType, model, name) => {
			const attributes = _.transform(attributeFields(model), (r, v, k) => {
				r.push(`
					${ k }: ${ v.type }
				`);
			}, []).join("\n");

			const associations = _.transform(this._modelDefs[name].associations, (r, v, k) => {
				let definition;

				switch(v.type) {
				case "hasMany":
					definition = `${ k }: [ ${ v.model } ]`;
					break;
				case "belongsTo":
				default:
					definition = `${ k }: ${ v.model }`;
					break;
				}

				r.push(`
					${ definition }
				`);
			}, []).join("\n");

			gType.push(`
	type ${ name } {
	${ attributes }
	${ associations }
	}

	type ${ name }WithCount {
		offset: Int
		limit: Int
		count: Int
		rows: [ ${ name } ]
	}`, []);
		}, []).join("\n");
	}
}

export default GraphQLManager;
