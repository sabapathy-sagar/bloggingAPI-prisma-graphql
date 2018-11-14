import bcrypt from 'bcryptjs';

const hashPassword = (password) => {
    if (password.length < 8) {
        throw new Error("Password should be at least 8 characters long.");
    }

    return bcrypt.hash(password, 10);
}

export { hashPassword as default }