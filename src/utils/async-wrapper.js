export function asyncWrapper(callback) {
	return function (request, response, next) {
		callback(request, response, next).catch(next);
	};
}
