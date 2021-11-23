"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilmController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const film_service_1 = require("./film.service");
let FilmController = class FilmController {
    constructor(filmService) {
        this.filmService = filmService;
    }
    getAvailableRegions() {
        return this.filmService.getAvailableRegions();
    }
};
__decorate([
    common_1.Get('api/regions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FilmController.prototype, "getAvailableRegions", null);
FilmController = __decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Controller(),
    __metadata("design:paramtypes", [film_service_1.FilmService])
], FilmController);
exports.FilmController = FilmController;
//# sourceMappingURL=film.controller.js.map