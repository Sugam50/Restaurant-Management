const errorHandler = (req, res) => {
    res.json({"error":"404 API Not Found"})
}

module.exports = {errorHandler}