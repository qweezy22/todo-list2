# front

FROM node:22-alpine AS frontend-build

WORKDIR /src/front

COPY front/package*.json ./

RUN npm install

COPY front/ ./

RUN npm run build



# back


FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build

WORKDIR /src

COPY TodoApi/TodoApi.csproj TodoApi/

RUN dotnet restore TodoApi/TodoApi.csproj

COPY TodoApi/ TodoApi/

RUN dotnet publish TodoApi/TodoApi.csproj \
    -c Release \
    -o /app/publish



# Image


FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=backend-build /app/publish .

COPY --from=frontend-build /src/front/dist ./wwwroot

ENV ASPNETCORE_URLS=http://0.0.0.0:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "TodoApi.dll"]
