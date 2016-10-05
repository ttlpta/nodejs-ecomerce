var categories = require('./categoriesModel'), _ = require('lodash'), helper = require('../helper');
module.exports = function (app) {
    app.post('/categories', helper.handleRequest(categories.saveCategory));
    app.get('/categories', helper.handleRequest(categories.listCat));
    app.get('/categories/:id', helper.handleRequest(categories.showCatById));
    app.delete('/categories/:id', helper.handleRequest(categories.deleteCat));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcmllc0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvQ2F0ZWdvcmllcy9jYXRlZ29yaWVzQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFDekMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFDckIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRztJQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDakUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM5RSxDQUFDLENBQUMifQ==