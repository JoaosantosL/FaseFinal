const AppError = require("../utils/appError");

const checkMusicAccess = (req, res, next) => {
    const userRole = req.user?.role;
    const musicIsExclusive = req.music?.isExclusive;
    
    // Se a música é exclusiva e o usuário não é pro ou artista
    if (musicIsExclusive && !["pro", "artist"].includes(userRole)) {
        return next(new AppError("Acesso restrito a assinantes Pro", 403));
    }
    
    next();
};

module.exports = checkMusicAccess;